async function simulateLoan() {
    const form = document.getElementById('loanForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/loan/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('simulationResult').innerHTML = generateResultHtml(result);
            document.getElementById('simulationResultContainer').style.display = 'block';
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al simular el préstamo.');
    }
}

function generateResultHtml(result) {
    let html = `
        <div class="result-columns">
            <div class="left-column">
                <p>Capital: ${parseFloat(result.capital).toFixed(2)}</p>
                <p>Tasa Anual: ${parseFloat(result.tasaAnual)}%</p>
                <p>Cuotas: ${parseInt(result.cuotas)}</p>
                <p>IVA: ${parseFloat(result.iva)}%</p>
            </div>
            <div class="right-column">
                <p>Fee Mensual: ${parseFloat(result.feeMensual).toFixed(2)}</p>
                <p>Costo de Otorgamiento: ${parseFloat(result.costoOtorgamiento).toFixed(2)}</p>
                <p>Sellado: ${parseFloat(result.sellado)}%</p>
                <p>Valor de Sellado: ${parseFloat(result.selladoAmount).toFixed(2)}</p>
                <p>Fecha de Vencimiento de la Primera Cuota: ${new Date(result.fechaPrimerVencimiento).toLocaleDateString('en-GB')}</p>
            </div>
        </div>
        <h2>Plan de Pagos</h2>
        <table>
            <thead>
                <tr>
                    <th>Cuota</th>
                    <th>Capital Pendiente</th>
                    <th>Interés</th>
                    <th>IVA sobre Interés</th>
                    <th>Amortización</th>
                    <th>Fee Mensual</th>
                    <th>Cuota sin IVA</th>
                    <th>Cuota Total</th>
                    <th>Fecha de Vencimiento</th>
                </tr>
            </thead>
            <tbody>`;

    result.planDePagos.forEach(pago => {
        const cuotaSinIva = parseFloat(pago.amortizacion) + parseFloat(pago.interes);
        const cuotaTotal = cuotaSinIva + parseFloat(pago.interesConIva) + parseFloat(pago.feeMensual);
        const fechaVencimiento = new Date(pago.fechaVencimiento).toLocaleDateString('en-GB');
        html += `
            <tr>
                <td>${parseInt(pago.cuota)}</td>
                <td>${parseFloat(pago.capitalPendiente).toFixed(2)}</td>
                <td>${parseFloat(pago.interes).toFixed(2)}</td>
                <td>${parseFloat(pago.interesConIva).toFixed(2)}</td>
                <td>${parseFloat(pago.amortizacion).toFixed(2)}</td>
                <td>${parseFloat(pago.feeMensual).toFixed(2)}</td>
                <td>${cuotaSinIva.toFixed(2)}</td>
                <td>${cuotaTotal.toFixed(2)}</td>
                <td>${fechaVencimiento}</td>
            </tr>`;
    });

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="2">Totales</th>
                    <th>${parseFloat(result.totalInteres).toFixed(2)}</th>
                    <th>${parseFloat(result.totalInteresConIva).toFixed(2)}</th>
                    <th>${parseFloat(result.totalAmortizacion).toFixed(2)}</th>
                    <th>${parseFloat(result.totalFeeMensual).toFixed(2)}</th>
                    <th>${(parseFloat(result.totalAmortizacion) + parseFloat(result.totalInteres)).toFixed(2)}</th>
                    <th>${(parseFloat(result.totalAmortizacion) + parseFloat(result.totalInteres) + parseFloat(result.totalInteresConIva) + parseFloat(result.totalFeeMensual)).toFixed(2)}</th>
                </tr>
            </tfoot>
        </table>`;

    return html;
}

async function confirmLoan() {
    if (confirm("¿Está seguro de que desea confirmar este préstamo?")) {
        const form = document.getElementById('loanForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/loan/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                document.getElementById('simulationResultContainer').style.display = 'block';
                document.getElementById('simulationResult').innerHTML = generateLoanDetailHtml(result.loan);
                document.querySelector('.simulation-result-container h1').style.display = 'none';
                document.querySelector('.simulation-result-container button').style.display = 'none';
                document.querySelector('.simulation-result-container').insertAdjacentHTML('beforeend', '<button class="btn-primary" type="button" onclick="window.location.reload()">Nuevo Préstamo</button>');
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al confirmar el préstamo.');
        }
    }
}

function generateLoanDetailHtml(loan) {
    let html = `
        <h1>Préstamo Registrado - Detalle de la Operación</h1>
        <div class="result-columns">
            <div class="left-column">
                <p>Capital: ${parseFloat(loan.capital).toFixed(2)}</p>
                <p>Tasa Anual: ${parseFloat(loan.tasaAnual)}%</p>
                <p>Cuotas: ${parseInt(loan.cuotas)}</p>
                <p>IVA: ${parseFloat(loan.iva)}%</p>
            </div>
            <div class="right-column">
                <p>Fee Mensual: ${parseFloat(loan.feeMensual).toFixed(2)}</p>
                <p>Costo de Otorgamiento: ${parseFloat(loan.costoOtorgamiento).toFixed(2)}</p>
                <p>Sellado: ${parseFloat(loan.sellado)}%</p>
                <p>Valor de Sellado: ${parseFloat(loan.selladoAmount).toFixed(2)}</p>
                <p>Fecha de Alta: ${new Date(loan.fechaAlta).toLocaleDateString('en-GB')}</p>
                <p>Fecha de Vencimiento de la Primera Cuota: ${new Date(loan.fechaVencimientoPrimerCuota).toLocaleDateString('en-GB')}</p>
            </div>
        </div>
        <h2>Plan de Pagos</h2>
        <table>
            <thead>
                <tr>
                    <th>Cuota</th>
                    <th>Capital Pendiente</th>
                    <th>Interés</th>
                    <th>IVA sobre Interés</th>
                    <th>Amortización</th>
                    <th>Fee Mensual</th>
                    <th>Cuota Total</th>
                    <th>Fecha de Vencimiento</th>
                </tr>
            </thead>
            <tbody>`;

    loan.planDePagos.forEach(pago => {
        html += `
            <tr>
                <td>${parseInt(pago.cuota)}</td>
                <td>${parseFloat(pago.capitalPendiente).toFixed(2)}</td>
                <td>${parseFloat(pago.interes).toFixed(2)}</td>
                <td>${parseFloat(pago.interesConIva).toFixed(2)}</td>
                <td>${parseFloat(pago.amortizacion).toFixed(2)}</td>
                <td>${parseFloat(pago.feeMensual).toFixed(2)}</td>
                <td>${parseFloat(pago.cuotaConFee).toFixed(2)}</td>
                <td>${new Date(pago.fechaVencimiento).toLocaleDateString('en-GB')}</td>
            </tr>`;
    });

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="2">Totales</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.interes), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.interesConIva), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.amortizacion), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.feeMensual), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.cuotaConFee), 0).toFixed(2)}</th>
                </tr>
            </tfoot>
        </table>`;

    return html;
}
