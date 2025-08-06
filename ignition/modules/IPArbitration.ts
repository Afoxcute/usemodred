import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const IPArbitrationModule = buildModule("IPArbitrationModule", (m) => {
  // UMA Protocol addresses for Etherlink (these would need to be updated with actual UMA deployments)
  const umaFinder = m.getParameter("umaFinder", "0x0000000000000000000000000000000000000000");
  const umaCurrency = m.getParameter("umaCurrency", "0x0000000000000000000000000000000000000000");
  const optimisticOracleV3 = m.getParameter("optimisticOracleV3", "0x0000000000000000000000000000000000000000");

  // Deploy IP Arbitration contract
  const ipArbitration = m.contract("IPArbitration", [
    umaFinder,
    umaCurrency,
    optimisticOracleV3
  ]);

  return { ipArbitration };
});

export default IPArbitrationModule; 