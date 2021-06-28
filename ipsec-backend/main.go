package main

func main() {
	app := App{}
	app.Initialize("/iox_data/appdata/ipsec.db")
	app.Run("0.0.0.0:8000")
}
