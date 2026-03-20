.PHONY: dev prod ssl migrate seed studio logs clean help

# ──────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────

dev:					## Start development environment (hot reload)
	docker compose -f docker-compose.dev.yml up --build

dev-bg:					## Start development in background
	docker compose -f docker-compose.dev.yml up --build -d

dev-down:				## Stop development environment
	docker compose -f docker-compose.dev.yml down

# ──────────────────────────────────────────────
# Production
# ──────────────────────────────────────────────

ssl:					## Generate self-signed SSL cert (dev/testing only)
	chmod +x nginx/gen-ssl.sh && ./nginx/gen-ssl.sh

prod:					## Start production environment
	docker compose up --build -d

prod-down:				## Stop production environment
	docker compose down

# ──────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────

migrate:				## Run database migrations
	docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

migrate-prod:			## Deploy migrations in production
	docker compose exec backend npx prisma migrate deploy

seed:					## Seed the database with demo data
	docker compose -f docker-compose.dev.yml exec backend npx ts-node src/prisma/seed.ts

studio:					## Open Prisma Studio (DB GUI)
	docker compose -f docker-compose.dev.yml exec backend npx prisma studio

# ──────────────────────────────────────────────
# Maintenance
# ──────────────────────────────────────────────

logs:					## Tail all container logs
	docker compose -f docker-compose.dev.yml logs -f

logs-backend:			## Tail backend logs only
	docker compose -f docker-compose.dev.yml logs -f backend

logs-frontend:			## Tail frontend logs only
	docker compose -f docker-compose.dev.yml logs -f frontend

clean:					## Remove all containers, volumes, and images
	docker compose -f docker-compose.dev.yml down -v --rmi local
	docker compose down -v --rmi local

# ──────────────────────────────────────────────
# Help
# ──────────────────────────────────────────────

help:					## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
