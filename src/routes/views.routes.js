import { Router } from "express";

const viewsRouter = Router();

viewsRouter.get('/home', (req, res) => {
    res.render('home');
});

viewsRouter.get("/form", (req, res) => {
    res.render("form");
});

viewsRouter.get("/loan/list", (req, res) => {
    res.render("loanList", { title: "Listado de Préstamos" });
});

viewsRouter.get("/loan/search", (req, res) => {
    res.render("loanSearch");
});

viewsRouter.get("/payments/search", (req, res) => {
    res.render("payment", { title: "Buscar y Cargar Pagos" });
});

viewsRouter.get("/accrue-interest", (req, res) => {
    res.render("accrueInterest"); 
});

viewsRouter.get("/cancel-installment", (req, res) => {
    res.render("cancelInstallment"); 
});

viewsRouter.get("/calculate-total-cancellation", (req, res) => {
    res.render("calculateTotalCancellation"); 
});

viewsRouter.get("/accrue-interest-result", (req, res) => {
    res.render("accrueInterestResult"); 
});

viewsRouter.get("/error", (req, res) => {
    res.render("error");
});

export default viewsRouter;
