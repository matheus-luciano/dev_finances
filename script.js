const Modal = {
    open(){
        document
            .querySelector('.modal-overlay')                                 
            .classList
            .add('active')
    },
    close(){
        document
            .querySelector('.modal-overlay')                                 
            .classList
            .remove('active')
    },    
}

const Box = {

    cardTotal() {
    let a = Transaction.total();
    if(a < 0){
        document.querySelector('.card.total').classList.add('negative');
    }else{
        document.querySelector('.card.total').classList.remove('negative');
    }
}
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances')) || []
    },

    set(transaction) {
        localStorage.setItem("dev.finances", JSON.stringify(transaction))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        // somar as entradas
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        });

        return income;
    },

    expenses(){
        //somar as saidas
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        });
        return expense;
    },

    total(){
        //entradas - saidas
        let total = 0;

        total = this.incomes() + this.expenses();

        return total;
    }
}

const Utils = {

    formatAmount(value){
        value = value*100;
        
        return Math.round(value);
    },

    formatDate(date){
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },
    formatCurrency(value){
       

        //usando o toLocaleString 

        const signal = Number(value) < 0 ? "-" :"";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return  signal + value;
        
        
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
                    
                    <td class="description">${transaction.description}</td>
                    <td class="${cssClass}">${amount}</td>
                    <td class="date">${transaction.date}</td>
                    <td><img class="remove-button" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>                
        `
        return html;
    },

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());

        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());

        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        };
    },

    validateFields(){
        const {description, amount, date} = this.getValues();

        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let {description, amount, date} = this.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
        
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault();

        try {        

            this.validateFields();
            const transaction = this.formatValues();
            this.clearFields();
            Transaction.add(transaction);
            this.clearFields();
            Modal.close();
            
            
        } catch (error) {  
            alert(error.message);  
        }
    }
}

const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set((Transaction.all));
        Box.cardTotal();
    },

    reload(){
        DOM.clearTransactions();
        this.init();
        
    }
}

App.init()