build:
	docker rmi vukhoa23/pna-invoice-fe:latest || true
	docker build -t vukhoa23/pna-invoice-fe:latest .
	docker push vukhoa23/pna-invoice-fe:latest