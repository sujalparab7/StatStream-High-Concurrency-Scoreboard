package main

import (
	"arena-api/controllers"
	"arena-api/database"
	"log"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err:=godotenv.Load();err!=nil{
		log.Println("Warning: No env file found")
	}

	db := database.ConnectDB()

	defer db.Close()

	r := gin.Default()

	r.Use(CORSMiddleware())

	r.Use(gzip.Gzip(gzip.DefaultCompression))

	userCtrl := controllers.UserController{DB: db}

	r.POST("/scores", controllers.AuthMiddleware(), userCtrl.Submitscores)

	r.POST("/register", userCtrl.RegisterUser)

	r.POST("/login",userCtrl.LoginUser)

	r.GET("/leaderboard", userCtrl.GetLeaderboard)

	r.GET("/test-token",userCtrl.GenerateTestToken)

	r.Run(":8081")
}


func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Allow your React frontend port to access this API
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		// Allow specific headers (including Authorization for your JWT tokens later!)
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		// Handle browser pre-flight OPTIONS request
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
