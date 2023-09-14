const launchUpdateDatabase = async () => {
    fetch("http://localhost:8383/update");
    console.log("Run update...")
}

launchUpdateDatabase();