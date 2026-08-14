# ------------------------------------------------------------------
# 営業日報システム — Cloud Run デプロイ用コマンド集
#
# 通常のデプロイ:
#   make release                 # ビルド → push → デプロイ を一括実行
#
# 初回のみ(GCP側のインフラ準備。手動で1回だけ実行する):
#   make setup-apis
#   make setup-artifact-registry
#   make setup-service-account
#   make setup-wif            # GITHUB_REPOはatsuaa/ai-nippou-systemがデフォルト。別リポジトリで使う場合はGITHUB_REPO=org/repoで上書き
# ------------------------------------------------------------------

PROJECT_ID ?= ma-ai-nippou-system
REGION     ?= asia-northeast1
SERVICE    ?= ai-nippou-system
REPO       ?= ai-nippou-system
TAG        ?= $(shell git rev-parse --short HEAD)

REGISTRY := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPO)
IMAGE    := $(REGISTRY)/$(SERVICE)

# setup-wif / setup-service-account 用
SA_NAME      ?= github-actions-deployer
SA_EMAIL     := $(SA_NAME)@$(PROJECT_ID).iam.gserviceaccount.com
WIF_POOL     ?= github-pool
WIF_PROVIDER ?= github-provider
GITHUB_REPO  ?= atsuaa/ai-nippou-system

.PHONY: help auth build push deploy release \
        setup-apis setup-artifact-registry setup-service-account setup-wif

help:
	@echo "make build     - Dockerイメージをビルド(タグ: $(TAG))"
	@echo "make push      - Artifact Registryへpush"
	@echo "make deploy    - Cloud Runへデプロイ($(SERVICE) / $(REGION))"
	@echo "make release   - build + push + deploy"
	@echo ""
	@echo "初回セットアップ:"
	@echo "make setup-apis"
	@echo "make setup-artifact-registry"
	@echo "make setup-service-account"
	@echo "make setup-wif                                     - GITHUB_REPO=$(GITHUB_REPO) (別リポジトリならGITHUB_REPO=org/repoで上書き)"

auth:
	gcloud auth configure-docker $(REGION)-docker.pkg.dev --quiet --project $(PROJECT_ID)

build:
	docker build -t $(IMAGE):$(TAG) -t $(IMAGE):latest .

push: auth
	docker push $(IMAGE):$(TAG)
	docker push $(IMAGE):latest

deploy:
	gcloud run deploy $(SERVICE) \
		--project $(PROJECT_ID) \
		--region $(REGION) \
		--image $(IMAGE):$(TAG) \
		--platform managed \
		--allow-unauthenticated \
		--quiet

release: build push deploy

# ------------------------------------------------------------------
# 初回セットアップ(手動で1回だけ実行する)
# ------------------------------------------------------------------

setup-apis:
	gcloud services enable \
		run.googleapis.com \
		artifactregistry.googleapis.com \
		iamcredentials.googleapis.com \
		--project $(PROJECT_ID)

setup-artifact-registry:
	gcloud artifacts repositories create $(REPO) \
		--project $(PROJECT_ID) \
		--repository-format docker \
		--location $(REGION) \
		--description "ai-nippou-system container images"

setup-service-account:
	gcloud iam service-accounts create $(SA_NAME) \
		--project $(PROJECT_ID) \
		--display-name "GitHub Actions deployer"
	gcloud projects add-iam-policy-binding $(PROJECT_ID) \
		--member "serviceAccount:$(SA_EMAIL)" --role roles/run.admin
	gcloud projects add-iam-policy-binding $(PROJECT_ID) \
		--member "serviceAccount:$(SA_EMAIL)" --role roles/artifactregistry.writer
	gcloud projects add-iam-policy-binding $(PROJECT_ID) \
		--member "serviceAccount:$(SA_EMAIL)" --role roles/iam.serviceAccountUser

setup-wif:
	@if [ -z "$(GITHUB_REPO)" ]; then \
		echo "GITHUB_REPO を指定してください。例: make setup-wif GITHUB_REPO=org/repo" >&2; \
		exit 1; \
	fi
	gcloud iam workload-identity-pools create $(WIF_POOL) \
		--project $(PROJECT_ID) --location global \
		--display-name "GitHub Actions Pool"
	gcloud iam workload-identity-pools providers create-oidc $(WIF_PROVIDER) \
		--project $(PROJECT_ID) --location global \
		--workload-identity-pool $(WIF_POOL) \
		--display-name "GitHub provider" \
		--issuer-uri "https://token.actions.githubusercontent.com" \
		--attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository" \
		--attribute-condition "assertion.repository == '$(GITHUB_REPO)'"
	$(eval PROJECT_NUMBER := $(shell gcloud projects describe $(PROJECT_ID) --format='value(projectNumber)'))
	gcloud iam service-accounts add-iam-policy-binding $(SA_EMAIL) \
		--project $(PROJECT_ID) \
		--role roles/iam.workloadIdentityUser \
		--member "principalSet://iam.googleapis.com/projects/$(PROJECT_NUMBER)/locations/global/workloadIdentityPools/$(WIF_POOL)/attribute.repository/$(GITHUB_REPO)"
	@echo ""
	@echo "GitHubリポジトリのSettings > Secrets and variables > Actions > Variablesに以下を設定してください:"
	@echo "  WIF_PROVIDER        = projects/$(PROJECT_NUMBER)/locations/global/workloadIdentityPools/$(WIF_POOL)/providers/$(WIF_PROVIDER)"
	@echo "  WIF_SERVICE_ACCOUNT = $(SA_EMAIL)"
