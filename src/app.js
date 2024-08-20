import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { __dirname } from "./utils.js";
import { engine } from "express-handlebars";
import configDotenv from "dotenv";
import connectDB from "./config/db.js";
import indexRouter from "./routes/index.routes.js";

configDotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

const __filename = fileURLToPath(import.meta.url);

app.engine('handlebars', engine({
    extname: '.handlebars',
    helpers: {
        totalInteres: (planDePagos) => {
            return planDePagos.reduce((acc, curr) => acc + parseFloat(curr.interes), 0).toFixed(2);
        },
        totalInteresConIva: (planDePagos) => {
            return planDePagos.reduce((acc, curr) => acc + parseFloat(curr.interesConIva), 0).toFixed(2);
        },
        totalAmortizacion: (planDePagos) => {
            return planDePagos.reduce((acc, curr) => acc + parseFloat(curr.amortizacion), 0).toFixed(2);
        },
        totalFeeMensual: (planDePagos) => {
            return planDePagos.reduce((acc, curr) => acc + parseFloat(curr.feeMensual), 0).toFixed(2);
        },
        sum: (a, b) => {
            const numA = parseFloat(a) || 0;
            const numB = parseFloat(b) || 0;
            return (numA + numB).toFixed(2);
        },
        formatDate: (dateString) => {
            const date = new Date(dateString);
            const day = ('0' + date.getDate()).slice(-2);
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));


app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app