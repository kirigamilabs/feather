import React from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Zap, Shield, Layers, Wallet, DollarSign, Activity } from 'lucide-react';

export const CryptoProducts = () => {
  const [selectedCategory, setCategory] = React.useState('all');

  const ProductCard = ({ 
    icon: Icon, 
    name, 
    symbol,
    category,
    description,
    features 
  }: { 
    icon: any; 
    name: string;
    symbol: string;
    category: string;
    description: string;
    features: string[];
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="font-bold text-lg break-words">{name}</h3>
            <p className="text-sm text-muted-foreground">{symbol}</p>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 break-words">{description}</p>
      
      <div className="space-y-2">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center space-x-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <span className="text-muted-foreground break-words">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const CategoryButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setCategory(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        selectedCategory === id
          ? 'bg-primary text-white'
          : 'bg-card hover:bg-primary/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const cryptoProducts = [
    {
      icon: Coins,
      name: 'Bitcoin',
      symbol: 'BTC',
      category: 'currency',
      description: 'The original cryptocurrency. Digital gold and store of value with AI-powered trading strategies.',
      features: ['Spot trading', 'DCA automation', 'Portfolio balancing', 'Market analysis']
    },
    {
      icon: Layers,
      name: 'Ethereum',
      symbol: 'ETH',
      category: 'currency',
      description: 'Smart contract platform powering DeFi. Trade ETH with intelligent gas optimization.',
      features: ['Smart contract interaction', 'Gas optimization', 'Staking management', 'Layer 2 integration']
    },
    {
      icon: Zap,
      name: 'Uniswap',
      symbol: 'UNI',
      category: 'defi',
      description: 'Leading decentralized exchange. AI-optimized swaps and liquidity provision.',
      features: ['Token swaps', 'Liquidity pools', 'Yield farming', 'Price impact analysis']
    },
    {
      icon: Shield,
      name: 'Aave',
      symbol: 'AAVE',
      category: 'defi',
      description: 'Decentralized lending protocol. Maximize yields with AI-driven lending strategies.',
      features: ['Lending & borrowing', 'Yield optimization', 'Risk assessment', 'Collateral management']
    },
    {
      icon: Activity,
      name: 'Chainlink',
      symbol: 'LINK',
      category: 'infrastructure',
      description: 'Decentralized oracle network. Access real-world data for smart contract execution.',
      features: ['Price feeds', 'Market data', 'Cross-chain operations', 'Data verification']
    },
    {
      icon: Wallet,
      name: 'Solana',
      symbol: 'SOL',
      category: 'currency',
      description: 'High-performance blockchain. Lightning-fast transactions with AI trade execution.',
      features: ['Fast transactions', 'Low fees', 'NFT integration', 'DeFi ecosystem']
    },
    {
      icon: DollarSign,
      name: 'Curve Finance',
      symbol: 'CRV',
      category: 'defi',
      description: 'Stablecoin DEX. Efficient stablecoin swaps with minimal slippage.',
      features: ['Stablecoin swaps', 'Liquidity mining', 'Governance', 'Cross-pool arbitrage']
    },
    {
      icon: TrendingUp,
      name: 'Compound',
      symbol: 'COMP',
      category: 'defi',
      description: 'Algorithmic money market. Automated yield strategies powered by AI.',
      features: ['Supply & borrow', 'Interest optimization', 'Governance participation', 'Portfolio rebalancing']
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? cryptoProducts 
    : cryptoProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header with Coming Soon Badge */}
      <div className="text-center space-y-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block"
        >
          <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 mb-4">
            <Coins className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Crypto Products
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
        >
          <span className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
            🚀 Coming Soon
          </span>
        </motion.div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access leading cryptocurrencies and DeFi protocols with AI-powered trading, optimization, and risk management
        </p>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        <CategoryButton id="all" label="All Products" icon={Layers} />
        <CategoryButton id="currency" label="Currencies" icon={Coins} />
        <CategoryButton id="defi" label="DeFi" icon={TrendingUp} />
        <CategoryButton id="infrastructure" label="Infrastructure" icon={Activity} />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product, i) => (
          <ProductCard key={i} {...product} />
        ))}
      </div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20"
      >
        <h3 className="text-lg font-semibold mb-4">AI-Powered Features for All Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Smart Trading</h4>
              <p className="text-sm text-muted-foreground">AI-optimized entry and exit points based on market conditions</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Risk Management</h4>
              <p className="text-sm text-muted-foreground">Automated stop-loss and position sizing recommendations</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Real-time Analysis</h4>
              <p className="text-sm text-muted-foreground">Continuous monitoring and instant alerts for market opportunities</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Cross-chain Support</h4>
              <p className="text-sm text-muted-foreground">Seamless operations across multiple blockchain networks</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};