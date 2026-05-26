package database

import(
	"log"
	_"github.com/lib/pq"
	"database/sql"
	"fmt"
)

func ConnectDB() *sql.DB{
	dns:="host=localhost port=5432 user=postgres password=admin dbname =postgres sslmode=disable"
	db,err:=sql.Open("postgres",dns)
	if err!=nil{
		log.Fatalf("Database could not be opened due to some issues")
	}

	err=db.Ping()
	if err!=nil{
		log.Fatalf("Database could not be pinged")
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


