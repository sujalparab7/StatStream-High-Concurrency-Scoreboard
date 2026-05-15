package main

import (
	"arena-api/controllers"
	"arena-api/database"

	"github.com/gin-gonic/gin"
)

func main() {
	db := database.ConnectDB()

	defer db.Close()

	r := gin.Default()

	userCtrl := controllers.UserController{DB: db}

	r.POST("/scores", controllers.AuthMiddleware(), userCtrl.Submitscores)

	r.GET("/leaderboard", userCtrl.GetLeaderboard)

	r.Run(":8081")
}
