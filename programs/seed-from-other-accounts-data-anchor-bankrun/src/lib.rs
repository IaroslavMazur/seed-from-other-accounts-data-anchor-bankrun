use anchor_lang::prelude::*;

declare_id!("7wbHQ8EauqhV6UqH6QAeJ4KXqurXuXgoBEJULM791gdK");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod seed_from_other_accounts_data_anchor_bankrun {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.some_data.bump = ctx.bumps.some_data;
        ctx.accounts.some_data.some_number = 42;

        Ok(())
    }

    pub fn create_pda_with_specific_seed(_ctx: Context<CreatePDAWithSpecificSeed>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + SomeData::INIT_SPACE,
        seeds = [b"some_data".as_ref()],
        bump
    )]
    pub some_data: Account<'info, SomeData>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePDAWithSpecificSeed<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [b"some_data".as_ref()],
        bump = some_data.bump,
    )]
    pub some_data: Account<'info, SomeData>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + CustomPDA::INIT_SPACE,
        seeds = [some_data.some_number.to_le_bytes().as_ref()],
        bump
    )]
    pub custom_pda: Account<'info, CustomPDA>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct SomeData {
    pub some_number: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct CustomPDA {}
