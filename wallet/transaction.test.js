const Transaction = require('./transaction');
const Wallet = require('./index');
const { MINING_REWARD } = require('../config');

describe('Transaction', () => {
    let transaction, wallet, recipient, amount;

    beforeEach(() => {
        wallet = new Wallet();
        amount = 50;
        recipient = 'r3c1p13nt';
        transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('outputs the `amount` subtracted from the wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount)
    });

    it('outputs the `amount` added to the recipient', () => {
        expect(transaction.outputs.find(output => output.address === recipient).amount).toEqual(amount)
    });

    it('inputs the balance of the wallet', () => {
        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it('validates a valid transaction', () => {
       expect(Transaction.verifyTransaction(transaction)).toEqual(true);
    });

    it('invalidates a corrupt transaction', () => {
        transaction.outputs[0].amount = 50000;
        expect(Transaction.verifyTransaction(transaction)).toEqual(false);
    });

    describe('transaction with an amount that exceeds the balance', () => {
        beforeEach(() => {
            amount = 5000;
            transaction = Transaction.newTransaction(wallet, recipient, amount);
        });

        it('does not create the transaction', () => {
            expect(transaction).toEqual(undefined);
        })
    });

    describe('updating a transaction', () => {
        let nextAmount, nextRecipient;
        beforeEach(() => {
           nextAmount = 20;
           nextRecipient = 'n3xt-4ddr55';
           transaction = transaction.update(wallet, nextRecipient, nextAmount);
        });

        it(`subtracts the next amount from the sender's output`, () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(wallet.balance - amount - nextAmount);
        });

        it('outputs an amount from the next amount', () => {
           expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
               .toEqual(nextAmount);
        });
    });

    describe('creating a reward transaction', () => {
       beforeEach(() => {
          transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
       });

       it(`reward the miner's wallet`, () => {
           expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
               .toEqual(MINING_REWARD);
       });
    });
});

