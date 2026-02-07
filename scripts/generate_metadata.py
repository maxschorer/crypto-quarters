"""
Generate shuffled metadata for Crypto Quarters.

This script:
1. Creates a random mapping of tokenId → (state, serial)
2. Generates JSON metadata files for each token
3. Outputs in batches for phased reveal

Usage:
    python generate_metadata.py --batch-size 10000 --output ./metadata
"""

import json
import random
import os
import argparse
from typing import List, Tuple

# 50 US States in order of statehood
STATES = [
    "Delaware", "Pennsylvania", "New Jersey", "Georgia", "Connecticut",
    "Massachusetts", "Maryland", "South Carolina", "New Hampshire", "Virginia",
    "New York", "North Carolina", "Rhode Island", "Vermont", "Kentucky",
    "Tennessee", "Ohio", "Louisiana", "Indiana", "Mississippi",
    "Illinois", "Alabama", "Maine", "Missouri", "Arkansas",
    "Michigan", "Florida", "Texas", "Iowa", "Wisconsin",
    "California", "Minnesota", "Oregon", "Kansas", "West Virginia",
    "Nevada", "Nebraska", "Colorado", "North Dakota", "South Dakota",
    "Montana", "Washington", "Idaho", "Wyoming", "Utah",
    "Oklahoma", "New Mexico", "Arizona", "Alaska", "Hawaii"
]

SERIALS_PER_STATE = 10_000
TOTAL_SUPPLY = len(STATES) * SERIALS_PER_STATE  # 500,000


def generate_shuffle() -> List[Tuple[str, int]]:
    """Generate a shuffled list of (state, serial) tuples."""
    all_quarters = []
    for state in STATES:
        for serial in range(1, SERIALS_PER_STATE + 1):
            all_quarters.append((state, serial))
    
    random.shuffle(all_quarters)
    return all_quarters


def generate_metadata(token_id: int, state: str, serial: int, image_base_url: str) -> dict:
    """Generate metadata JSON for a single token."""
    state_slug = state.lower().replace(" ", "-")
    
    return {
        "name": f"{state} #{serial}",
        "description": f"Crypto Quarter: {state}, Serial #{serial} of 10,000",
        "image": f"{image_base_url}/{state_slug}.png",
        "animation_url": f"{image_base_url}/{state_slug}.mp4",
        "attributes": [
            {"trait_type": "State", "value": state},
            {"trait_type": "Serial", "value": serial},
            {"trait_type": "State Number", "value": STATES.index(state) + 1}
        ]
    }


def main():
    parser = argparse.ArgumentParser(description="Generate Crypto Quarters metadata")
    parser.add_argument("--batch-size", type=int, default=10000, help="Tokens per batch")
    parser.add_argument("--output", type=str, default="./metadata", help="Output directory")
    parser.add_argument("--image-base-url", type=str, default="ipfs://PLACEHOLDER", help="Base URL for images")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility")
    args = parser.parse_args()
    
    if args.seed:
        random.seed(args.seed)
    
    print(f"Generating shuffle for {TOTAL_SUPPLY} tokens...")
    shuffle = generate_shuffle()
    
    # Save the shuffle mapping
    os.makedirs(args.output, exist_ok=True)
    mapping_path = os.path.join(args.output, "shuffle_mapping.json")
    with open(mapping_path, "w") as f:
        json.dump([{"tokenId": i, "state": s, "serial": n} for i, (s, n) in enumerate(shuffle)], f)
    print(f"Saved shuffle mapping to {mapping_path}")
    
    # Generate metadata in batches
    num_batches = (TOTAL_SUPPLY + args.batch_size - 1) // args.batch_size
    
    for batch_num in range(num_batches):
        start_idx = batch_num * args.batch_size
        end_idx = min(start_idx + args.batch_size, TOTAL_SUPPLY)
        
        batch_dir = os.path.join(args.output, f"batch_{batch_num:03d}")
        os.makedirs(batch_dir, exist_ok=True)
        
        for token_id in range(start_idx, end_idx):
            state, serial = shuffle[token_id]
            metadata = generate_metadata(token_id, state, serial, args.image_base_url)
            
            metadata_path = os.path.join(batch_dir, f"{token_id}.json")
            with open(metadata_path, "w") as f:
                json.dump(metadata, f, indent=2)
        
        print(f"Generated batch {batch_num + 1}/{num_batches}: tokens {start_idx}-{end_idx-1}")
    
    print(f"\nDone! Metadata saved to {args.output}")
    print(f"Total batches: {num_batches}")
    print(f"\nNext steps:")
    print(f"1. Create quarter images for each state")
    print(f"2. Upload images to IPFS")
    print(f"3. Update image_base_url and regenerate metadata")
    print(f"4. Upload metadata batches to IPFS as you increase maxMintable")


if __name__ == "__main__":
    main()
