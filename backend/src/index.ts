import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import remittanceRouter from "./routes/remittance";
import vaultRouter from "./routes/vault";
import txRouter from "./routes/transactions";
import loansRouter from "./routes/loans";
import farmersRouter from "./routes/farmers";
import lenderRouter from "./routes/lender";
import oracleRouter from "./routes/oracle";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/remittance", remittanceRouter);
app.use("/api/vault", vaultRouter);
app.use("/api/transactions", txRouter);
app.use("/api/loans", loansRouter);
app.use("/api/farmers", farmersRouter);
app.use("/api/lender", lenderRouter);
app.use("/api/oracle", oracleRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

export default app;
