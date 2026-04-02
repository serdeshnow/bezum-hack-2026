package auth

import "github.com/gin-gonic/gin"

const ContextKey = "auth"

type Context struct {
	UserID    int    `json:"userId"`
	Role      string `json:"role"`
	SessionID string `json:"sessionId"`
}

func Set(c *gin.Context, auth Context) {
	c.Set(ContextKey, auth)
}

func Get(c *gin.Context) (Context, bool) {
	value, ok := c.Get(ContextKey)
	if !ok {
		return Context{}, false
	}

	auth, ok := value.(Context)
	return auth, ok
}
