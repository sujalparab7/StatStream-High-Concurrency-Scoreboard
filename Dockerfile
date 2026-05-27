FROM golang:1.25-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . . 

RUN go build -o arena-api .

EXPOSE 8081

CMD ["./arena-api"]