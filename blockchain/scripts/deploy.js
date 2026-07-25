const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Contract = await ethers.getContractFactory("TouristIdentity");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ TouristIdentity deployed to:", address);

  // save address for frontend/backend use
  const fs = require("fs");
  fs.writeFileSync(
    "./deployed.json",
    JSON.stringify({ TouristIdentity: address, network: hre.network.name, deployedAt: new Date().toISOString() }, null, 2)
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
