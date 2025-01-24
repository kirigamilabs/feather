interface ParsedResponse {
    text: string;
    actions: Action[];
    transactions: Transaction[];
    insights: MarketInsight[];
  }
  
  export const parseAIResponse = (response: string): ParsedResponse => {
    const actions = extractActions(response);
    const transactions = extractTransactions(response);
    const insights = extractInsights(response);
    
    // Clean response text
    const text = response
      .replace(/<action>.*?<\/action>/g, '')
      .replace(/<transaction>.*?<\/transaction>/g, '')
      .replace(/<insight>.*?<\/insight>/g, '')
      .trim();
  
    return { text, actions, transactions, insights };
  };