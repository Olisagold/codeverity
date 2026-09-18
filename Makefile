.PHONY: up down build logs test

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

test:
	$(MAKE) -C tests integration
