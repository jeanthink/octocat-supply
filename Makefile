# OctoCAT Supply Chain Management - Makefile
# Cross-platform compatible (Linux, macOS, Windows); on Windows run make from Git Bash or WSL with PowerShell available in PATH for internal commands.
# Supports both template (api-nodejs, api-python) and promoted (api) folder structures within actually rendered repositories for easier startup.

# Detect OS for platform-specific commands
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
    RM_RF = powershell -Command "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue"
else
    DETECTED_OS := $(shell uname -s)
    RM_RF = rm -rf
endif

# Allow overriding backend via environment variable (e.g., BACKEND=python make dev)
ifeq ($(OS),Windows_NT)
BACKEND ?= $(shell powershell -Command " \
	if (Test-Path 'api') { \
		if (Test-Path 'api/package.json') { Write-Output 'nodejs' } \
		elseif (Test-Path 'api/pyproject.toml') { Write-Output 'python' } \
		elseif (Test-Path 'api/pom.xml') { Write-Output 'java' } \
		else { Write-Output 'unknown' } \
	} elseif ((Test-Path 'api-nodejs') -and (Test-Path 'api-python') -and (Test-Path 'api-java')) { Write-Output 'nodejs' } \
	elseif (Test-Path 'api-nodejs') { Write-Output 'nodejs' } \
	elseif (Test-Path 'api-python') { Write-Output 'python' } \
	elseif (Test-Path 'api-java') { Write-Output 'java' } \
	else { Write-Output 'unknown' } \
")
else
BACKEND ?= $(shell \
	if [ -d "api" ]; then \
		if [ -f "api/package.json" ]; then echo "nodejs"; \
		elif [ -f "api/pyproject.toml" ]; then echo "python"; \
		elif [ -f "api/pom.xml" ]; then echo "java"; \
		else echo "unknown"; fi \
	elif [ -d "api-nodejs" ] && [ -d "api-python" ] && [ -d "api-java" ]; then echo "nodejs"; \
	elif [ -d "api-nodejs" ]; then echo "nodejs"; \
	elif [ -d "api-python" ]; then echo "python"; \
	elif [ -d "api-java" ]; then echo "java"; \
	else echo "unknown"; fi \
)
endif

# Determine API directory (template vs promoted)
ifeq ($(OS),Windows_NT)
API_DIR := $(shell powershell -Command " \
	if (Test-Path 'api') { Write-Output 'api' } \
	elseif (Test-Path 'api-$(BACKEND)') { Write-Output 'api-$(BACKEND)' } \
	else { Write-Output 'api' } \
")
else
API_DIR := $(shell \
	if [ -d "api" ]; then echo "api"; \
	elif [ -d "api-$(BACKEND)" ]; then echo "api-$(BACKEND)"; \
	else echo "api"; fi \
)
endif

FRONTEND_DIR := frontend

.DEFAULT_GOAL := help

##@ General

.PHONY: help
help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: info
info: ## Show detected backend, OS, and directories
	@echo "Detected OS:        $(DETECTED_OS)"
	@echo "Detected Backend:   $(BACKEND)"
	@echo "API Directory:      $(API_DIR)"
	@echo "Frontend Directory: $(FRONTEND_DIR)"

##@ Installation

.PHONY: install
install: ## Install all dependencies
	@echo "Installing dependencies for $(BACKEND) backend..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm install
	cd $(FRONTEND_DIR) && npm install
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) install
	cd $(FRONTEND_DIR) && npm install
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) install
	cd $(FRONTEND_DIR) && npm install
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

##@ Development

.PHONY: dev
dev: ## Start development servers (API + Frontend)
	@echo "Starting development environment with $(BACKEND) backend..."
ifeq ($(BACKEND),nodejs)
ifeq ($(OS),Windows_NT)
	npx concurrently --kill-others "cd $(API_DIR) && npm run dev" "cd $(FRONTEND_DIR) && set VITE_API_URL=http://localhost:3000 && npm run dev"
else
	@trap 'kill 0' INT; \
	(cd $(API_DIR) && npm run dev) & \
	(cd $(FRONTEND_DIR) && VITE_API_URL=http://localhost:3000 npm run dev) & \
	wait
endif
else ifeq ($(BACKEND),python)
	@$(MAKE) -C $(API_DIR) db-seed
ifeq ($(OS),Windows_NT)
	npx concurrently --kill-others "cd $(API_DIR) && $(MAKE) dev" "cd $(FRONTEND_DIR) && set VITE_API_URL=http://localhost:3000 && npm run dev"
else
	@trap 'kill 0' INT; \
	(cd $(API_DIR) && $(MAKE) dev) & \
	(cd $(FRONTEND_DIR) && VITE_API_URL=http://localhost:3000 npm run dev) & \
	wait
endif
else ifeq ($(BACKEND),java)
	$(MAKE) build
ifeq ($(OS),Windows_NT)
	npx concurrently --kill-others "cd $(API_DIR) && $(MAKE) dev" "cd $(FRONTEND_DIR) && set VITE_API_URL=http://localhost:3000 && npm run dev"
else
	@trap 'kill 0' INT; \
	(cd $(API_DIR) && $(MAKE) dev) & \
	(cd $(FRONTEND_DIR) && VITE_API_URL=http://localhost:3000 npm run dev) & \
	wait
endif
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: dev-api
dev-api: ## Start only the API development server
	@echo "Starting API development server ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run dev
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) dev
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) dev
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: dev-frontend
dev-frontend: ## Start only the frontend development server
	@echo "Starting frontend development server..."
	cd $(FRONTEND_DIR) && npm run dev

##@ Database

.PHONY: db-init
db-init: ## Initialize database schema
	@echo "Initializing database ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run db:init
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) db-init
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) db-init
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: db-seed
db-seed: ## Initialize and seed database with sample data
	@echo "Seeding database ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run db:seed
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) db-seed
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) db-seed
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

##@ Building

.PHONY: build
build: ## Build all projects
	@echo "Building projects ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run build
	cd $(FRONTEND_DIR) && npm run build
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) build
	cd $(FRONTEND_DIR) && npm run build
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) build
	cd $(FRONTEND_DIR) && npm run build
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: build-api
build-api: ## Build only the API
	@echo "Building API ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run build
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) build
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) build
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: build-frontend
build-frontend: ## Build only the frontend
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm run build

##@ Testing

.PHONY: test
test: ## Run all tests
	@echo "Running tests ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run test
	cd $(FRONTEND_DIR) && npm run test
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) test
	cd $(FRONTEND_DIR) && npm run test
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) test
	cd $(FRONTEND_DIR) && npm run test
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: test-api
test-api: ## Run API tests
	@echo "Running API tests ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run test
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) test
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) test
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd $(FRONTEND_DIR) && npm run test

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	@echo "Running E2E tests..."
	cd $(FRONTEND_DIR) && npm run test:e2e

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run test:coverage
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) test-coverage
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && $(MAKE) test
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

##@ Linting

.PHONY: lint
lint: ## Lint all code
	@echo "Linting code ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run lint
	cd $(FRONTEND_DIR) && npm run lint
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) lint
	cd $(FRONTEND_DIR) && npm run lint
else ifeq ($(BACKEND),java)
	@echo "Java linting via Maven checkstyle (run during test phase)"
	cd $(FRONTEND_DIR) && npm run lint
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: lint-fix
lint-fix: ## Lint and auto-fix issues
	@echo "Linting and fixing code ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run lint:fix
	cd $(FRONTEND_DIR) && npm run lint -- --fix
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) lint-fix
	cd $(FRONTEND_DIR) && npm run lint -- --fix
else ifeq ($(BACKEND),java)
	@echo "Java linting via Maven (run during test phase)"
	cd $(FRONTEND_DIR) && npm run lint -- --fix
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

.PHONY: format
format: ## Format code with prettier/ruff
	@echo "Formatting code ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	npx prettier --write "$(API_DIR)/**/*.{ts,tsx}" "$(FRONTEND_DIR)/**/*.{ts,tsx}"
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) format
	cd $(FRONTEND_DIR) && npx prettier --write "src/**/*.{ts,tsx}"
else ifeq ($(BACKEND),java)
	@echo "Java formatting via Maven plugins (configured in pom.xml)"
	cd $(FRONTEND_DIR) && npx prettier --write "src/**/*.{ts,tsx}"
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

##@ Code Generation

.PHONY: swagger
swagger: ## Regenerate Swagger/OpenAPI spec (api-swagger.json)
	@echo "Regenerating Swagger spec..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm run swagger:generate
else
	@echo "Swagger generation only supported for nodejs backend"
endif

##@ Production

.PHONY: start
start: ## Start production server
	@echo "Starting production server ($(BACKEND))..."
ifeq ($(BACKEND),nodejs)
	cd $(API_DIR) && npm start
else ifeq ($(BACKEND),python)
	cd $(API_DIR) && $(MAKE) start
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && ./mvnw spring-boot:run
else
	@echo "Error: Unknown backend '$(BACKEND)'"
	@exit 1
endif

##@ Docker

.PHONY: docker-build
docker-build: ## Build Docker images
	@echo "Building Docker images..."
	docker-compose build

.PHONY: docker-up
docker-up: ## Start Docker containers
	@echo "Starting Docker containers..."
	docker-compose up

.PHONY: docker-down
docker-down: ## Stop Docker containers
	@echo "Stopping Docker containers..."
	docker-compose down

##@ Cleaning

.PHONY: clean
clean: ## Clean build artifacts and dependencies
	@echo "Cleaning build artifacts..."
ifeq ($(BACKEND),nodejs)
	$(RM_RF) node_modules $(API_DIR)/node_modules $(FRONTEND_DIR)/node_modules
	$(RM_RF) $(API_DIR)/dist $(FRONTEND_DIR)/dist
else ifeq ($(BACKEND),python)
	$(RM_RF) $(API_DIR)/.venv $(API_DIR)/__pycache__ $(API_DIR)/src/__pycache__
	$(RM_RF) $(API_DIR)/.pytest_cache $(API_DIR)/htmlcov $(API_DIR)/.coverage
	$(RM_RF) $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist
else ifeq ($(BACKEND),java)
	cd $(API_DIR) && ./mvnw clean
	$(RM_RF) $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist
else
	@echo "Cleaning common artifacts..."
	$(RM_RF) */node_modules */dist */__pycache__ */.venv */target
endif
ifeq ($(OS),Windows_NT)
	$(RM_RF) $(API_DIR)/*.db
	$(RM_RF) $(API_DIR)/*.db-*
else
	$(RM_RF) $(API_DIR)/*.db $(API_DIR)/*.db-*
endif
