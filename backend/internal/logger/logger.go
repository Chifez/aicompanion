package logger

import (
	"log"
	"os"
)

func New(env string) *log.Logger {
	flag := log.LstdFlags | log.Lmicroseconds
	prefix := "[" + env + "] "
	return log.New(os.Stdout, prefix, flag)
}

