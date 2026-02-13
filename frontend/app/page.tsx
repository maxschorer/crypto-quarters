'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TODO: Replace with deployed contract address
const CONTRACT_ADDRESS = '0x...' as const;

// State & Territory data with positions for the map (approximate x,y percentages)
const STATES = [
  // 50 States
  { name: 'Alabama', abbr: 'AL', x: 65, y: 65 },
  { name: 'Alaska', abbr: 'AK', x: 12, y: 82 },
  { name: 'Arizona', abbr: 'AZ', x: 22, y: 58 },
  { name: 'Arkansas', abbr: 'AR', x: 55, y: 55 },
  { name: 'California', abbr: 'CA', x: 10, y: 45 },
  { name: 'Colorado', abbr: 'CO', x: 32, y: 45 },
  { name: 'Connecticut', abbr: 'CT', x: 88, y: 32 },
  { name: 'Delaware', abbr: 'DE', x: 85, y: 40 },
  { name: 'Florida', abbr: 'FL', x: 75, y: 78 },
  { name: 'Georgia', abbr: 'GA', x: 72, y: 62 },
  { name: 'Hawaii', abbr: 'HI', x: 22, y: 85 },
  { name: 'Idaho', abbr: 'ID', x: 20, y: 25 },
  { name: 'Illinois', abbr: 'IL', x: 60, y: 42 },
  { name: 'Indiana', abbr: 'IN', x: 65, y: 42 },
  { name: 'Iowa', abbr: 'IA', x: 52, y: 38 },
  { name: 'Kansas', abbr: 'KS', x: 42, y: 48 },
  { name: 'Kentucky', abbr: 'KY', x: 68, y: 48 },
  { name: 'Louisiana', abbr: 'LA', x: 55, y: 72 },
  { name: 'Maine', abbr: 'ME', x: 92, y: 18 },
  { name: 'Maryland', abbr: 'MD', x: 82, y: 42 },
  { name: 'Massachusetts', abbr: 'MA', x: 90, y: 28 },
  { name: 'Michigan', abbr: 'MI', x: 65, y: 30 },
  { name: 'Minnesota', abbr: 'MN', x: 50, y: 25 },
  { name: 'Mississippi', abbr: 'MS', x: 60, y: 65 },
  { name: 'Missouri', abbr: 'MO', x: 52, y: 48 },
  { name: 'Montana', abbr: 'MT', x: 28, y: 20 },
  { name: 'Nebraska', abbr: 'NE', x: 42, y: 38 },
  { name: 'Nevada', abbr: 'NV', x: 15, y: 40 },
  { name: 'New Hampshire', abbr: 'NH', x: 90, y: 22 },
  { name: 'New Jersey', abbr: 'NJ', x: 86, y: 38 },
  { name: 'New Mexico', abbr: 'NM', x: 30, y: 58 },
  { name: 'New York', abbr: 'NY', x: 82, y: 28 },
  { name: 'North Carolina', abbr: 'NC', x: 78, y: 52 },
  { name: 'North Dakota', abbr: 'ND', x: 42, y: 22 },
  { name: 'Ohio', abbr: 'OH', x: 72, y: 40 },
  { name: 'Oklahoma', abbr: 'OK', x: 42, y: 55 },
  { name: 'Oregon', abbr: 'OR', x: 12, y: 25 },
  { name: 'Pennsylvania', abbr: 'PA', x: 78, y: 35 },
  { name: 'Rhode Island', abbr: 'RI', x: 91, y: 30 },
  { name: 'South Carolina', abbr: 'SC', x: 76, y: 58 },
  { name: 'South Dakota', abbr: 'SD', x: 42, y: 28 },
  { name: 'Tennessee', abbr: 'TN', x: 68, y: 52 },
  { name: 'Texas', abbr: 'TX', x: 40, y: 68 },
  { name: 'Utah', abbr: 'UT', x: 22, y: 42 },
  { name: 'Vermont', abbr: 'VT', x: 88, y: 22 },
  { name: 'Virginia', abbr: 'VA', x: 78, y: 45 },
  { name: 'Washington', abbr: 'WA', x: 14, y: 15 },
  { name: 'West Virginia', abbr: 'WV', x: 75, y: 45 },
  { name: 'Wisconsin', abbr: 'WI', x: 58, y: 28 },
  { name: 'Wyoming', abbr: 'WY', x: 30, y: 32 },
  // 6 Territories (DC & Territories Program)
  { name: 'District of Columbia', abbr: 'DC', x: 83, y: 43, isTerritory: true },
  { name: 'Puerto Rico', abbr: 'PR', x: 88, y: 88, isTerritory: true },
  { name: 'Guam', abbr: 'GU', x: 5, y: 92, isTerritory: true },
  { name: 'American Samoa', abbr: 'AS', x: 12, y: 95, isTerritory: true },
  { name: 'U.S. Virgin Islands', abbr: 'VI', x: 92, y: 92, isTerritory: true },
  { name: 'Northern Mariana Islands', abbr: 'MP', x: 5, y: 85, isTerritory: true },
];

type StateType = typeof STATES[0] & { isTerritory?: boolean };

function QuarterSlot({ 
  state, 
  owned, 
  count,
  onClick 
}: { 
  state: StateType;
  owned: boolean;
  count: number;
  onClick: () => void;
}) {
  const isTerritory = state.isTerritory;
  
  return (
    <button
      onClick={onClick}
      className={`
        absolute w-10 h-10 rounded-full border-2 
        flex items-center justify-center
        transition-all duration-300 transform hover:scale-110
        ${owned 
          ? isTerritory
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-lg shadow-blue-500/30'
            : 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 shadow-lg shadow-amber-500/30' 
          : isTerritory
            ? 'bg-slate-800/80 border-blue-600/50 hover:border-blue-400'
            : 'bg-slate-800/80 border-slate-600 hover:border-slate-400'
        }
      `}
      style={{ 
        left: `${state.x}%`, 
        top: `${state.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      title={`${state.name}${isTerritory ? ' (Territory)' : ''}${owned ? ` (${count} owned)` : ''}`}
    >
      <span className={`text-xs font-bold ${owned ? (isTerritory ? 'text-blue-900' : 'text-amber-900') : 'text-slate-400'}`}>
        {state.abbr}
      </span>
    </button>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [selectedState, setSelectedState] = useState<StateType | null>(null);

  // Mock data for owned states - TODO: Replace with actual contract reads
  const [ownedStates] = useState<Record<string, number>>({
    'CA': 3,
    'NY': 1,
    'TX': 2,
  });

  // Read contract state
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [],
    functionName: 'totalSupply',
  });

  const { data: mintCost } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [],
    functionName: 'getMintCost',
    args: [BigInt(quantity)],
  });

  const { writeContract, isPending } = useWriteContract();

  const handleMint = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: [],
      functionName: 'mint',
      args: [BigInt(quantity)],
      value: mintCost || BigInt(0),
    });
  };

  const ownedCount = Object.keys(ownedStates).length;
  const totalOwned = Object.values(ownedStates).reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/stars.svg')] bg-repeat"></div>
      </div>

      <div className="relative container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              🪙 Crypto Quarters
            </h1>
            <p className="text-slate-400 text-sm">America's Digital Collection</p>
          </div>
          <ConnectButton />
        </header>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Collection Map - Main Focus */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-amber-400">Your Collection Map</CardTitle>
                  <span className="text-sm text-slate-400">
                    <span className="text-amber-400 font-bold">{ownedCount}</span> / 56 collected
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* US Map with Quarter Slots */}
                <div className="relative w-full aspect-[1.6] bg-gradient-to-br from-blue-900/30 to-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
                  {/* Background US map */}
                  <img 
                    src="/us-map.svg" 
                    alt="US Map" 
                    className="absolute inset-0 w-full h-full object-contain opacity-30 p-4"
                  />
                  
                  {/* Quarter slots */}
                  {STATES.map((state) => (
                    <QuarterSlot
                      key={state.abbr}
                      state={state}
                      owned={!!ownedStates[state.abbr]}
                      count={ownedStates[state.abbr] || 0}
                      onClick={() => setSelectedState(state)}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300"></div>
                    <span className="text-slate-400">State (Owned)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-blue-300"></div>
                    <span className="text-slate-400">Territory (Owned)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600"></div>
                    <span className="text-slate-400">Not Collected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collection Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{totalOwned}</div>
                  <div className="text-xs text-slate-400">Quarters Owned</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{ownedCount}/56</div>
                  <div className="text-xs text-slate-400">Collected</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{Math.round(ownedCount / 56 * 100)}%</div>
                  <div className="text-xs text-slate-400">Complete</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Mint & Info */}
          <div className="space-y-6">
            
            {/* Mint Box */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/30 shadow-xl shadow-amber-500/5">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-3 shadow-lg shadow-amber-500/30">
                    <span className="text-4xl">🪙</span>
                  </div>
                  <h3 className="text-xl font-bold">Mint Quarters</h3>
                  <p className="text-slate-400 text-sm">Random state, unique serial</p>
                </div>

                {isConnected ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-slate-400 text-sm mb-2">Quantity</label>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                        >
                          −
                        </Button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-16 h-10 bg-slate-900 text-center rounded-lg border border-slate-600 font-bold"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(50, quantity + 1))}
                          className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Price</span>
                        <span className="text-green-400 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-400">Gas</span>
                        <span className="text-slate-300">~0.001 ETH</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleMint}
                      disabled={isPending}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-lg font-bold shadow-lg shadow-amber-500/30"
                    >
                      {isPending ? 'Minting...' : `Mint ${quantity} Quarter${quantity > 1 ? 's' : ''}`}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-400 mb-3">Connect wallet to mint</p>
                    <ConnectButton />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-400 text-base">About the Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span>🏛️</span>
                    <span>50 states + 6 territories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🔢</span>
                    <span>10,000 serials each</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🎲</span>
                    <span>Random on mint</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>💎</span>
                    <span>560,000 total supply</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>⛓️</span>
                    <span>On Base L2</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Global Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Global Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Minted</span>
                    <span className="font-mono">{totalSupply?.toString() || '0'} / 560,000</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" 
                      style={{ width: `${(Number(totalSupply || 0) / 560000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Built on Base • Contract: 0x... • <a href="#" className="text-amber-400 hover:underline">OpenSea</a></p>
        </footer>
      </div>

      {/* State Detail Modal */}
      {selectedState && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedState(null)}
        >
          <Card
            className="bg-slate-800 max-w-sm w-full border-slate-600"
            onClick={e => e.stopPropagation()}
          >
            <CardContent className="p-6 text-center">
              <div className="inline-block p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-3">
                <span className="text-3xl">🪙</span>
              </div>
              <h3 className="text-xl font-bold">{selectedState.name}</h3>
              <p className="text-slate-400">{selectedState.abbr}{selectedState.isTerritory ? ' (Territory)' : ''}</p>
              
              {ownedStates[selectedState.abbr] ? (
                <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                  <p className="text-green-400">You own {ownedStates[selectedState.abbr]} quarter(s)</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-slate-400">Not yet in your collection</p>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setSelectedState(null)}
                className="mt-4"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
