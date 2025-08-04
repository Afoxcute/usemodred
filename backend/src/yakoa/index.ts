import { registerToYakoa } from "./yakoascanner";

async function main() {
  try {
    const result = await registerToYakoa();
    console.log("🎉 Registration completed successfully!");
    console.log("📋 Result:", result);
  } catch (error) {
    console.error("💥 Registration failed:", error);
    process.exit(1);
  }
}

main();
