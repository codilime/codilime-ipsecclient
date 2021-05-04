package main

func main() {
	app := App{}
	app.Initialize("./ipsec.db")
	app.Run("0.0.0.0:8000")
}
