'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';

// TODO: Replace with deployed contract address
const CONTRACT_ADDRESS = '0x...' as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);

  // Read contract state
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [], // TODO: Add ABI
    functionName: 'totalSupply',
  });

  const { data: maxMintable } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [],
    functionName: 'maxMintable',
  });

  const { data: remainingForWallet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [],
    functionName: 'remainingMintable',
    args: address ? [address] : undefined,
  });

  const { data: mintCost } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [],
    functionName: 'getMintCost',
    args: [BigInt(quantity)],
  });

  // Write contract
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Crypto Quarters</h1>
          <ConnectButton />
        </header>

        {/* Hero */}
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Collect All 50 States</h2>
          <p className="text-xl text-slate-300 mb-8">
            500,000 unique quarters. 50 states. 10,000 serials each.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-3xl font-bold">{totalSupply?.toString() || '0'}</div>
              <div className="text-slate-400">Minted</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-3xl font-bold">{maxMintable?.toString() || '0'}</div>
              <div className="text-slate-400">Available</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-3xl font-bold">500,000</div>
              <div className="text-slate-400">Total Supply</div>
            </div>
          </div>
        </section>

        {/* Mint Section */}
        {isConnected ? (
          <section className="max-w-md mx-auto bg-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Mint Quarters</h3>
            
            <div className="mb-4">
              <label className="block text-slate-300 mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="bg-slate-800 text-center w-20 py-2 rounded"
                />
                <button
                  onClick={() => setQuantity(Math.min(Number(remainingForWallet || 50), quantity + 1))}
                  className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded"
                >
                  +
                </button>
              </div>
              <p className="text-slate-400 text-sm mt-2">
                You can mint up to {remainingForWallet?.toString() || '50'} more
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-slate-300">
                <span>Cost:</span>
                <span>{mintCost ? `${Number(mintCost) / 1e18} ETH` : 'FREE'}</span>
              </div>
            </div>

            <button
              onClick={handleMint}
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-500 py-3 rounded-lg font-bold"
            >
              {isPending ? 'Minting...' : `Mint ${quantity} Quarter${quantity > 1 ? 's' : ''}`}
            </button>
          </section>
        ) : (
          <section className="text-center">
            <p className="text-slate-400 mb-4">Connect your wallet to mint</p>
          </section>
        )}

        {/* Map Section - TODO */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold mb-4 text-center">Your Collection</h3>
          <p className="text-center text-slate-400">Map view coming soon...</p>
        </section>
      </div>
    </main>
  );
}
