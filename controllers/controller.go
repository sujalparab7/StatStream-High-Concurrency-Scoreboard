package controllers

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("super_secret_encryption_key_123")

type UserController struct {
	DB *sql.DB
}

type AuthInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type ScoreInput struct {
	Score    int    `json:"score"`
	Language string `json:"language"`
}

type LeaderboardEntry struct{
	UserId string `json:"user_id"`
	Score int `json:"score"`
	Language string `json:"language"`
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader:=c.GetHeader("Authorization")
		if authHeader==""{
			c.JSON(401,gin.H{"error":"Authorization header missing"})
			c.Abort()
			return	
		}
		parts:=strings.Split(authHeader," ")
		if len(parts)!=2 || parts[0]!="Bearer"{
			c.JSON(401,gin.H{"error":"Invalid token format.Use Bearer <token>"})
			c.Abort()
			return 
		}
		tokenString:=parts[1]
		token,err:=jwt.Parse(tokenString,func(token *jwt.Token)(interface{},error){
			if _,ok:=token.Method.(*jwt.SigningMethodHMAC);!ok{
				return nil,fmt.Errorf("unexpected signing method")
			}
			return jwtKey,nil
		})
		if err!=nil ||!token.Valid{
			c.JSON(400,gin.H{"error":"Invalid or expired token"})
			c.Abort()
			return 
		}
		if claims,ok:=token.Claims.(jwt.MapClaims);ok{
			if userID,ok:=claims["user_id"].(string);ok{
				c.Set("user_id",userID)
				c.Next()
				return
			}
		}
		c.JSON(401,gin.H{"error":"Token Invalid"})
		c.Abort()
	}
}

func GenerateToken(userID string) (string,error){
	claims:=jwt.MapClaims{
		"user_id":userID,
		"exp":time.Now().Add(time.Hour * 24).Unix(),
	}

	token:=jwt.NewWithClaims(jwt.SigningMethodHS256,claims)

	return token.SignedString(jwtKey)
}

func (u *UserController) GenerateTestToken(c *gin.Context){
	tokenString,err:=GenerateToken("user_999")
	if err!=nil{
		c.JSON(400,gin.H{"error":"Test token generation failed","error is":err.Error()})
		return 
	}
	c.JSON(201,gin.H{
		"message":"Copy the string below to use in your Authenticationa account",
		"token":tokenString,
	})
}

func HashPassword(password string) (string,error){
	bytes,err:=bcrypt.GenerateFromPassword([]byte(password),14)
	return string(bytes),err
}

func CheckPasswordHash(password, hash string) bool{
	err:=bcrypt.CompareHashAndPassword([]byte (hash),[]byte (password))
	return err==nil
}

func (u *UserController) RegisterUser(c *gin.Context){
	var input AuthInput
	if err:=c.ShouldBindJSON(&input);err!=nil{
		c.JSON(400,gin.H{"error":"Invalid JSON body"})
		return 
	}
	hashedPassword,err:=HashPassword(input.Password)
	if err!=nil{
		c.JSON(500,gin.H{"error":"Password was not hashed correctly"})
		return
	}
	userID:=fmt.Sprintf("user_id %d",time.Now().Unix())

	insertSQL:=`INSERT into competitors (id,username,password_hash) VALUES($1,$2,$3)`
	_,err=u.DB.Exec(insertSQL,userID,input.Username,hashedPassword)

	if err!=nil{
		c.JSON(409,gin.H{
			"error":"Database rejected the insert",
			"details":err.Error(),
		})
		return 
	}

	c.JSON(201,gin.H{
		"message":"Competitor registered successfully",
		"userID":userID,
	})
}

func (u *UserController) LoginUser(c *gin.Context){
	var input AuthInput
	if err:=c.ShouldBindJSON(&input);err!=nil{
		c.JSON(400,gin.H{"error":"Invalid JSON Body"})
		return
	}
	
	var userID,passwordHash string
	query:=`SELECT id,password_hash from competitors WHERE username=$1`
	err:=u.DB.QueryRow(query,input.Username).Scan(&userID,&passwordHash)

	if err!=nil{
		c.JSON(400,gin.H{
			"error":"Invalid username or password",
			"actual error is":err.Error(),
		})
		return
	}

	if !CheckPasswordHash(input.Password,passwordHash){
		c.JSON(401,gin.H{
			"error":"Invalid username or password",
			"actual error is":err.Error(),
		})
		return
	}

	tokenString,err:=GenerateToken(userID)
	if err!=nil{
			c.JSON(500,gin.H{"error":"Invalid or expired token"})
			return
		}

	c.JSON(201,gin.H{
		"message":"Login Successfull",
		"token":tokenString,
	})
}

func (u *UserController) Submitscores(c *gin.Context) {
	var input ScoreInput
	if err:=c.ShouldBindJSON(&input);err!=nil{
		c.JSON(400,gin.H{"error":"Invalid JSON body"})
		return
	}
	userID,exists:=c.Get("user_id")
	if !exists{
		c.JSON(400,gin.H{"error":"Middleware forgot to pass the ID"})
		return 
	}
	
	insertSQL := `INSERT INTO scores (user_id, score, language) VALUES ($1, $2, $3)`
	
	_,err:=u.DB.Exec(insertSQL,userID,input.Score,input.Language)
	
	if err!=nil{
		c.JSON(500,gin.H{"error":"Failed to save score to database","details":err.Error()})
		return
	}
	c.JSON(201,gin.H{"message":"Score successfully submitted"})
}

func (u *UserController) GetLeaderboard(c *gin.Context) {
	query:=`SELECT user_id,score,language FROM scores ORDER BY score DESC LIMIT 5`
	rows,err:=u.DB.Query(query)
	if err!=nil{
		c.JSON(400,gin.H{"error":"Failed to fetch leaderboard","details":err.Error()})
		return 
	}
	
	defer rows.Close()

	var leaderboard [] LeaderboardEntry

	for rows.Next(){
		
		var entry LeaderboardEntry

		err:=rows.Scan(&entry.UserId,&entry.Score,&entry.Language)

		if err!=nil{
			c.JSON(400,gin.H{"error":"Error reading a row","details":err.Error()})
			return
		}
		leaderboard=append(leaderboard,entry)
	}
	if leaderboard==nil{
			leaderboard=[]LeaderboardEntry{}
	}
	c.JSON(200,leaderboard)
}
