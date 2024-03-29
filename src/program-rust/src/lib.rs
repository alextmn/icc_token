use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key 
    accounts: &[AccountInfo], // The account to pay the tx against
    _instruction_data: &[u8], // ICC data: hash of receiver, pub key sender, signature of sender
) -> ProgramResult {
    msg!("ICC Payload length: {} ", _instruction_data.len());

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account 
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("This account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Increment and store the number of times the account has been greeted
    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    greeting_account.counter += 1;
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("ICC Transferd {} time(s)!", greeting_account.counter);

    Ok(())
}
// qnt_add_from => has256(pub_qnt)
// JS/Wallet
// blocking logging
//pub fn transfer(r, hash, amount, balance, qnt_add_from, qunt_address_to, **prev_hash**) {
// spike: how to lookup transaction on the ledger: qnt_add_from->prev_hash
    // 1. prev_tx = lookup previous tx  using qnt_add_from// spike ??
    // 2. prev_hash = prev_tx.hash
   // 3. hash(r ^ amount ^ add_from ^ address_to) == hash_prev
    // 4. save hash => storage
    // 5  save qnt_add_from, qunt_address_to
//}
