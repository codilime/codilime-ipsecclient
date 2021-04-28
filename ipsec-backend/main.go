package main

func main() {
	app := App{}
	app.Initialize("./ipsec.db")
	app.Run("localhost:8000")
}
