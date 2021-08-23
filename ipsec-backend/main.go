package main

func main() {
	app := App{}
	err := app.Initialize("/iox_data/appdata/ipsec.db")
	if err != nil {
		panic(err)
	}
	app.Run("0.0.0.0:8000")
}
