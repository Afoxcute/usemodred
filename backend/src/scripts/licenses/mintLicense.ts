import { Address } from 'viem'
import { client } from '../../utils/config'

// TODO: Replace with your own IP ID and license terms id
const IP_ID: Address = '0x8F0A1Ac6ca4f8CB0417112069c0f4Dc93B9F0217'
const LICENSE_TERMS_ID: string = '1605'

const main = async function () {
    // 1. Mint License Tokens
    //
    // Docs: https://docs.story.foundation/sdk-reference/license#mintlicensetokens
    const response = await client.license.mintLicenseTokens({
        licenseTermsId: LICENSE_TERMS_ID,
        licensorIpId: IP_ID,
        amount: 1,
        maxMintingFee: BigInt(0), // disabled
        maxRevenueShare: 100, // default
        txOptions: { waitForTransaction: true },
    })

    console.log('License minted:', {
        'Transaction Hash': response.txHash,
        'License Token IDs': response.licenseTokenIds,
    })
}

main()
