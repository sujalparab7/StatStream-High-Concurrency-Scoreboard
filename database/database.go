package database

import(
	"log"
	"fmt"
	"os"
	_"github.com/lib/pq"
	"database/sql"
)

func ConnectDB() *sql.DB{
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")     
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", 
    dbHost, dbPort, dbUser, dbPass, dbName)
	db,err:=sql.Open("postgres",connStr)
	if err!=nil{
		log.Fatalf("Database could not be opened due to some issues")
	}

	err=db.Ping()
	if err!=nil{
		log.Fatalf("Database could not be pinged %v",err)
	}

	fmt.Println("Database connected successfully!")

	sqlQuery := `
	CREATE TABLE IF NOT EXISTS competitors (
		id TEXT PRIMARY KEY,
		username TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS scores (
		id SERIAL PRIMARY KEY,
		user_id TEXT NOT NULL,
		score INT, 
		language TEXT NOT NULL
	);`

 	_,err=db.Exec(sqlQuery)
	if err!=nil{
		log.Fatalf("Failed to create tables:%v",err)
	}

	return db

}


