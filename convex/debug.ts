import { query } from "./_generated/server";

export const listAllTables = query({
  handler: async (ctx) => {
    // Try to find data in different possible table names
    const results: any = {};
    
    try {
      results.users = await ctx.db.query("users").collect();
    } catch (e) {
      results.users_error = "Table doesn't exist";
    }
    
    try {
      results.user = await ctx.db.query("user").collect();
    } catch (e) {
      results.user_error = "Table doesn't exist";
    }
    
    try {
      results.accounts = await ctx.db.query("accounts").collect();
    } catch (e) {
      results.accounts_error = "Table doesn't exist";
    }
    
    try {
      results.account = await ctx.db.query("account").collect();
    } catch (e) {
      results.account_error = "Table doesn't exist";
    }
    
    return results;
  },
});
