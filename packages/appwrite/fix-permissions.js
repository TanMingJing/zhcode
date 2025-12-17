import { Client, Databases } from "node-appwrite";

const client = new Client();

client
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("694124fc00267079b6cd")
  .setKey(
    "standard_a6151f64095c36d052dcd38d39dc379060830dc3417787e0d8ba65a0821495b70b9281bb985a3c8d25642f173e6a18124330bb8a3d3095b4673ca9421a272b36e142243874349181c86467886e34adb28d223f65088aadd97db61a7534734adba05ba1caa5db6736904e0e3bbed5992129204ef12f86c358bf67cde6c5d062d7"
  );

const databases = new Databases(client);

async function fixPermissions() {
  try {
    console.log("Updating collection permissions...");

    // Get the current collection first
    const collection = await databases.getCollection("zhcode_db", "users");
    console.log("Current collection:", collection.name);

    // Update with proper permissions format
    const updated = await databases.updateCollection(
      "zhcode_db",
      "users",
      "users", // name
      true,    // enabled
      null     // permissions - will use existing/defaults
    );

    console.log("✅ Collection permissions updated!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

fixPermissions();
