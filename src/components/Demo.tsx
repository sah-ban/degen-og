// "use client";

// import { useEffect, useCallback, useState, useMemo } from "react";
// import { Input } from "../components/ui/input"
// import { signIn, signOut, getCsrfToken } from "next-auth/react";
// import sdk, {
//     AddFrame,
//   FrameNotificationDetails,
//   SignIn as SignInCore,
//   type Context,
// } from "@farcaster/frame-sdk";
// import {
//   useAccount,
//   useSendTransaction,
//   useSignMessage,
//   useSignTypedData,
//   useWaitForTransactionReceipt,
//   useDisconnect,
//   useConnect,
//   useSwitchChain,
//   useChainId,
// } from "wagmi";

// import { config } from "~/components/providers/WagmiProvider";
// import { Button } from "~/components/ui/Button";
// import { truncateAddress } from "~/lib/truncateAddress";
// import { base, optimism } from "wagmi/chains";
// import { BaseError, UserRejectedRequestError } from "viem";
// import { useSession } from "next-auth/react"
// import { createStore } from 'mipd'
// import { Label } from "~/components/ui/label";


// export default function Demo(
//   { title }: { title?: string } = { title: "Frames v2 Demo" }
// ) {
//   const [isSDKLoaded, setIsSDKLoaded] = useState(false);
//   const [context, setContext] = useState<Context.FrameContext>();
//   const [isContextOpen, setIsContextOpen] = useState(false);
//   const [txHash, setTxHash] = useState<string | null>(null);

//   const [added, setAdded] = useState(false);
//   const [notificationDetails, setNotificationDetails] =
//     useState<FrameNotificationDetails | null>(null);

//   const [lastEvent, setLastEvent] = useState("");

//   const [addFrameResult, setAddFrameResult] = useState("");
//   const [sendNotificationResult, setSendNotificationResult] = useState("");

//   useEffect(() => {
//     setNotificationDetails(context?.client.notificationDetails ?? null);
//   }, [context]);

//   const { address, isConnected } = useAccount();
//   const chainId = useChainId();

//   const {
//     sendTransaction,
//     error: sendTxError,
//     isError: isSendTxError,
//     isPending: isSendTxPending,
//   } = useSendTransaction();

//   const { isLoading: isConfirming, isSuccess: isConfirmed } =
//     useWaitForTransactionReceipt({
//       hash: txHash as `0x${string}`,
//     });

//   const {
//     signTypedData,
//     error: signTypedError,
//     isError: isSignTypedError,
//     isPending: isSignTypedPending,
//   } = useSignTypedData();

//   const { disconnect } = useDisconnect();
//   const { connect } = useConnect();

//   const {
//     switchChain,
//     error: switchChainError,
//     isError: isSwitchChainError,
//     isPending: isSwitchChainPending,
//   } = useSwitchChain();

//   const handleSwitchChain = useCallback(() => {
//     switchChain({ chainId: chainId === base.id ? optimism.id : base.id });
//   }, [switchChain, chainId]);

//   useEffect(() => {
//     const load = async () => {
//       const context = await sdk.context;
//       setContext(context);
//       setAdded(context.client.added);

//       sdk.on("frameAdded", ({ notificationDetails }) => {
//         setLastEvent(
//           `frameAdded${!!notificationDetails ? ", notifications enabled" : ""}`
//         );

//         setAdded(true);
//         if (notificationDetails) {
//           setNotificationDetails(notificationDetails);
//         }
//       });

//       sdk.on("frameAddRejected", ({ reason }) => {
//         setLastEvent(`frameAddRejected, reason ${reason}`);
//       });

//       sdk.on("frameRemoved", () => {
//         setLastEvent("frameRemoved");
//         setAdded(false);
//         setNotificationDetails(null);
//       });

//       sdk.on("notificationsEnabled", ({ notificationDetails }) => {
//         setLastEvent("notificationsEnabled");
//         setNotificationDetails(notificationDetails);
//       });
//       sdk.on("notificationsDisabled", () => {
//         setLastEvent("notificationsDisabled");
//         setNotificationDetails(null);
//       });

//       sdk.on("primaryButtonClicked", () => {
//         console.log("primaryButtonClicked");
//       });

//       console.log("Calling ready");
//       sdk.actions.ready({});

// // Set up a MIPD Store, and request Providers.
// const store = createStore()

// // Subscribe to the MIPD Store.
// store.subscribe(providerDetails => {
//   console.log("PROVIDER DETAILS", providerDetails)
//   // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
// })

//     };
//     if (sdk && !isSDKLoaded) {
//       console.log("Calling load");
//       setIsSDKLoaded(true);
//       load();
//       return () => {
//         sdk.removeAllListeners();
//       };
//     }
//   }, [isSDKLoaded]);

//   const openUrl = useCallback(() => {
//     sdk.actions.openUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
//   }, []);

//   const openWarpcastUrl = useCallback(() => {
//     sdk.actions.openUrl("https://warpcast.com/~/compose");
//   }, []);

//   const close = useCallback(() => {
//     sdk.actions.close();
//   }, []);

//   const addFrame = useCallback(async () => {
//     try {
//       setNotificationDetails(null);

//       const result = await sdk.actions.addFrame();

//       if (result.notificationDetails) {
//         setNotificationDetails(result.notificationDetails);
//       }
//       setAddFrameResult(
//         result.notificationDetails
//           ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
//           : "Added, got no notification details"
//       );
//     } catch (error) {
//       if (error instanceof AddFrame.RejectedByUser) {
//         setAddFrameResult(`Not added: ${error.message}`);
//       }
      
//       if (error instanceof AddFrame.InvalidDomainManifest) {
//         setAddFrameResult(`Not added: ${error.message}`);
//       }

//       setAddFrameResult(`Error: ${error}`);
//     }
//   }, []);

//   const sendNotification = useCallback(async () => {
//     setSendNotificationResult("");
//     if (!notificationDetails || !context) {
//       return;
//     }

//     try {
//       const response = await fetch("/api/send-notification", {
//         method: "POST",
//         mode: "same-origin",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           fid: context.user.fid,
//           notificationDetails,
//         }),
//       });

//       if (response.status === 200) {
//         setSendNotificationResult("Success");
//         return;
//       } else if (response.status === 429) {
//         setSendNotificationResult("Rate limited");
//         return;
//       }

//       const data = await response.text();
//       setSendNotificationResult(`Error: ${data}`);
//     } catch (error) {
//       setSendNotificationResult(`Error: ${error}`);
//     }
//   }, [context, notificationDetails]);

//   const sendTx = useCallback(() => {
//     sendTransaction(
//       {
//         // call yoink() on Yoink contract
//         to: "0x4bBFD120d9f352A0BEd7a014bd67913a2007a878",
//         data: "0x9846cd9efc000023c0",
//       },
//       {
//         onSuccess: (hash) => {
//           setTxHash(hash);
//         },
//       }
//     );
//   }, [sendTransaction]);

//   const signTyped = useCallback(() => {
//     signTypedData({
//       domain: {
//         name: "Frames v2 Demo",
//         version: "1",
//         chainId,
//       },
//       types: {
//         Message: [{ name: "content", type: "string" }],
//       },
//       message: {
//         content: "Hello from Frames v2!",
//       },
//       primaryType: "Message",
//     });
//   }, [chainId, signTypedData]);

//   const toggleContext = useCallback(() => {
//     setIsContextOpen((prev) => !prev);
//   }, []);

//   if (!isSDKLoaded) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div style={{ 
//       paddingTop: context?.client.safeAreaInsets?.top ?? 0, 
//       paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
//       paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
//       paddingRight: context?.client.safeAreaInsets?.right ?? 0 ,
//     }}>
//       <div className="w-[300px] mx-auto py-2 px-2">
//         <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

//         <div className="mb-4">
//           <h2 className="font-2xl font-bold">Context</h2>
//           <button
//             onClick={toggleContext}
//             className="flex items-center gap-2 transition-colors"
//           >
//             <span
//               className={`transform transition-transform ${
//                 isContextOpen ? "rotate-90" : ""
//               }`}
//             >
//               ➤
//             </span>
//             Tap to expand
//           </button>

//           {isContextOpen && (
//             <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 {JSON.stringify(context, null, 2)}
//               </pre>
//             </div>
//           )}
//         </div>

//         <div>
//           <h2 className="font-2xl font-bold">Actions</h2>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.signIn
//               </pre>
//             </div>
//             <SignIn />
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.openUrl
//               </pre>
//             </div>
//             <Button onClick={openUrl}>Open Link</Button>
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.openUrl
//               </pre>
//             </div>
//             <Button onClick={openWarpcastUrl}>Open Warpcast Link</Button>
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.viewProfile
//               </pre>
//             </div>
//             <ViewProfile />
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.close
//               </pre>
//             </div>
//             <Button onClick={close}>Close Frame</Button>
//           </div>
//         </div>

//         <div className="mb-4">
//           <h2 className="font-2xl font-bold">Last event</h2>

//           <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
//             <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//               {lastEvent || "none"}
//             </pre>
//           </div>
//         </div>

//         <div>
//           <h2 className="font-2xl font-bold">Add to client & notifications</h2>

//           <div className="mt-2 mb-4 text-sm">
//             Client fid {context?.client.clientFid},
//             {added ? " frame added to client," : " frame not added to client,"}
//             {notificationDetails
//               ? " notifications enabled"
//               : " notifications disabled"}
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.addFrame
//               </pre>
//             </div>
//             {addFrameResult && (
//               <div className="mb-2 text-sm">
//                 Add frame result: {addFrameResult}
//               </div>
//             )}
//             <Button onClick={addFrame} disabled={added}>
//               Add frame to client
//             </Button>
//           </div>

//           {sendNotificationResult && (
//             <div className="mb-2 text-sm">
//               Send notification result: {sendNotificationResult}
//             </div>
//           )}
//           <div className="mb-4">
//             <Button onClick={sendNotification} disabled={!notificationDetails}>
//               Send notification
//             </Button>
//           </div>
//         </div>

//         <div>
//           <h2 className="font-2xl font-bold">Wallet</h2>

//           {address && (
//             <div className="my-2 text-xs">
//               Address: <pre className="inline">{truncateAddress(address)}</pre>
//             </div>
//           )}

//           {chainId && (
//             <div className="my-2 text-xs">
//               Chain ID: <pre className="inline">{chainId}</pre>
//             </div>
//           )}

//           <div className="mb-4">
//             <Button
//               onClick={() =>
//                 isConnected
//                   ? disconnect()
//                   : connect({ connector: config.connectors[0] })
//               }
//             >
//               {isConnected ? "Disconnect" : "Connect"}
//             </Button>
//           </div>

//           <div className="mb-4">
//             <SignMessage />
//           </div>

//           {isConnected && (
//             <>
//               <div className="mb-4">
//                 <SendEth />
//               </div>
//               <div className="mb-4">
//                 <Button
//                   onClick={sendTx}
//                   disabled={!isConnected || isSendTxPending}
//                   isLoading={isSendTxPending}
//                 >
//                   Send Transaction (contract)
//                 </Button>
//                 {isSendTxError && renderError(sendTxError)}
//                 {txHash && (
//                   <div className="mt-2 text-xs">
//                     <div>Hash: {truncateAddress(txHash)}</div>
//                     <div>
//                       Status:{" "}
//                       {isConfirming
//                         ? "Confirming..."
//                         : isConfirmed
//                         ? "Confirmed!"
//                         : "Pending"}
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mb-4">
//                 <Button
//                   onClick={signTyped}
//                   disabled={!isConnected || isSignTypedPending}
//                   isLoading={isSignTypedPending}
//                 >
//                   Sign Typed Data
//                 </Button>
//                 {isSignTypedError && renderError(signTypedError)}
//               </div>
//               <div className="mb-4">
//                 <Button
//                   onClick={handleSwitchChain}
//                   disabled={isSwitchChainPending}
//                   isLoading={isSwitchChainPending}
//                 >
//                   Switch to {chainId === base.id ? "Optimism" : "Base"}
//                 </Button>
//                 {isSwitchChainError && renderError(switchChainError)}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function SignMessage() {
//   const { isConnected } = useAccount();
//   const { connectAsync } = useConnect();
//   const {
//     signMessage,
//     data: signature,
//     error: signError,
//     isError: isSignError,
//     isPending: isSignPending,
//   } = useSignMessage();

//   const handleSignMessage = useCallback(async () => {
//     if (!isConnected) {
//       await connectAsync({
//         chainId: base.id,
//         connector: config.connectors[0],
//       });
//     }

//     signMessage({ message: "Hello from Frames v2!" });
//   }, [connectAsync, isConnected, signMessage]);

//   return (
//     <>
//       <Button
//         onClick={handleSignMessage}
//         disabled={isSignPending}
//         isLoading={isSignPending}
//       >
//         Sign Message
//       </Button>
//       {isSignError && renderError(signError)}
//       {signature && (
//         <div className="mt-2 text-xs">
//           <div>Signature: {signature}</div>
//         </div>
//       )}
//     </>
//   );
// }

// function SendEth() {
//   const { isConnected, chainId } = useAccount();
//   const {
//     sendTransaction,
//     data,
//     error: sendTxError,
//     isError: isSendTxError,
//     isPending: isSendTxPending,
//   } = useSendTransaction();

//   const { isLoading: isConfirming, isSuccess: isConfirmed } =
//     useWaitForTransactionReceipt({
//       hash: data,
//     });

//   const toAddr = useMemo(() => {
//     // Protocol guild address
//     return chainId === base.id
//       ? "0x32e3C7fD24e175701A35c224f2238d18439C7dBC"
//       : "0xB3d8d7887693a9852734b4D25e9C0Bb35Ba8a830";
//   }, [chainId]);

//   const handleSend = useCallback(() => {
//     sendTransaction({
//       to: toAddr,
//       value: 1n,
//     });
//   }, [toAddr, sendTransaction]);

//   return (
//     <>
//       <Button
//         onClick={handleSend}
//         disabled={!isConnected || isSendTxPending}
//         isLoading={isSendTxPending}
//       >
//         Send Transaction (eth)
//       </Button>
//       {isSendTxError && renderError(sendTxError)}
//       {data && (
//         <div className="mt-2 text-xs">
//           <div>Hash: {truncateAddress(data)}</div>
//           <div>
//             Status:{" "}
//             {isConfirming
//               ? "Confirming..."
//               : isConfirmed
//               ? "Confirmed!"
//               : "Pending"}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// function SignIn() {
//   const [signingIn, setSigningIn] = useState(false);
//   const [signingOut, setSigningOut] = useState(false);
//   const [signInResult, setSignInResult] = useState<SignInCore.SignInResult>();
//   const [signInFailure, setSignInFailure] = useState<string>();
//   const { data: session, status } = useSession()

//   const getNonce = useCallback(async () => {
//     const nonce = await getCsrfToken();
//     if (!nonce) throw new Error("Unable to generate nonce");
//     return nonce;
//   }, []);

//   const handleSignIn = useCallback(async () => {
//     try {
//       setSigningIn(true);
//       setSignInFailure(undefined);
//       const nonce = await getNonce();
//       const result = await sdk.actions.signIn({ nonce });
//       setSignInResult(result);

//       await signIn("credentials", {
//         message: result.message,
//         signature: result.signature,
//         redirect: false,
//       });
//     } catch (e) {
//       if (e instanceof SignInCore.RejectedByUser) {
//         setSignInFailure("Rejected by user");
//         return;
//       }

//       setSignInFailure("Unknown error");
//     } finally {
//       setSigningIn(false);
//     }
//   }, [getNonce]);

//   const handleSignOut = useCallback(async () => {
//     try {
//       setSigningOut(true);
//       await signOut({ redirect: false }) 
//       setSignInResult(undefined);
//     } finally {
//       setSigningOut(false);
//     }
//   }, []);

//   return (
//     <>
//       {status !== "authenticated" &&
//         <Button
//           onClick={handleSignIn}
//           disabled={signingIn}
//         >
//           Sign In with Farcaster
//         </Button>
//       }
//       {status === "authenticated" &&
//         <Button
//           onClick={handleSignOut}
//           disabled={signingOut}
//         >
//           Sign out
//         </Button>
//       }
//       {session &&
//         <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
//           <div className="font-semibold text-gray-500 mb-1">Session</div>
//           <div className="whitespace-pre">{JSON.stringify(session, null, 2)}</div>
//         </div>
//       }
//       {signInFailure && !signingIn && (
//         <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
//           <div className="font-semibold text-gray-500 mb-1">SIWF Result</div>
//           <div className="whitespace-pre">{signInFailure}</div>
//         </div>
//       )}
//       {signInResult && !signingIn && (
//         <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
//           <div className="font-semibold text-gray-500 mb-1">SIWF Result</div>
//           <div className="whitespace-pre">{JSON.stringify(signInResult, null, 2)}</div>
//         </div>
//       )}
//     </>
//   );
// }

// function ViewProfile() {
//   const [fid, setFid] = useState('3');

//   return (
//     <>
//       <div>
//         <Label className="text-xs font-semibold text-gray-500 mb-1" htmlFor="view-profile-fid">Fid</Label>
//         <Input
//           id="view-profile-fid"
//           type="number"
//           value={fid}
//           className="mb-2"
//           onChange={(e) => { 
//             setFid(e.target.value)
//           }}
//           step="1"
//           min="1"
//         />
//       </div>
//       <Button
//         onClick={() => { sdk.actions.viewProfile({ fid: parseInt(fid) }) }}
//       >
//         View Profile
//       </Button>
//     </>
//   );
// }

// const renderError = (error: Error | null) => {
//   if (!error) return null;
//   if (error instanceof BaseError) {
//     const isUserRejection = error.walk(
//       (e) => e instanceof UserRejectedRequestError
//     );

//     if (isUserRejection) {
//       return <div className="text-red-500 text-xs mt-1">Rejected by user.</div>;
//     }
//   }

//   return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
// };

"use client";

import { useEffect, useCallback, useState } from "react";
// import sdk, {
//   FrameNotificationDetails,
//   type Context,
// } from "@farcaster/frame-sdk";

import sdk, {
    AddFrame,
  FrameNotificationDetails,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import { Button } from "~/components/ui/Button";
import Link from 'next/link';
import Image from 'next/image';

export default function Demo(
  { title }: { title?: string } = { title: "demo title" }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const [addFrameResult, setAddFrameResult] = useState("");

  // const [addFrameResult, setAddFrameResult] = useState("");
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);
  // const [sendNotificationResult, setSendNotificationResult] = useState("");
  // const [setSendNotificationResult] = useState("");


  useEffect(() => {
    setNotificationDetails(context?.client.notificationDetails ?? null);
  }, [context]);


  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready({});
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl("https://warpcast.com/cashlessman.eth");
  }, []);

  const openWarpcastUrl = useCallback(() => {
    sdk.actions.openUrl(shareUrl);
  }, []);

  const tip = useCallback(() => {
    sdk.actions.openUrl(tipUrl);
  }, []);

  const close = useCallback(() => {
    sdk.actions.close();
  }, []);

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : "Added, got no notification details"
      );
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }
      
      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);
////////////////////////////////
  // const sendNotification = useCallback(async () => {
  //   setSendNotificationResult("");
  //   if (!notificationDetails || !context) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/send-notification", {
  //       method: "POST",
  //       mode: "same-origin",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         fid: context.user.fid,
  //         notificationDetails,
  //       }),
  //     });

  //     if (response.status === 200) {
  //       setSendNotificationResult("Success");
  //       return;
  //     } else if (response.status === 429) {
  //       setSendNotificationResult("Rate limited");
  //       return;
  //     }

  //     const data = await response.text();
  //     setSendNotificationResult(`Error: ${data}`);
  //   } catch (error) {
  //     setSendNotificationResult(`Error: ${error}`);
  //   }
  // }, [context, notificationDetails]);
  ////////////////////////////////////////////////////////////////

interface allowancesData {
  snapshot_day: string;
  user_rank: string;
  tip_allowance: string;
  remaining_tip_allowance: string;
  wallet_addresses: string[];
}

interface DegenResponse {
  data: allowancesData[];
  points: string;
  pointsRank: string;
}

const [data, setData] = useState<DegenResponse | null>(null);

const Degen = useCallback(async (fid: string) => {
  try {
    const aroundResponse = await fetch(`/api/degen?fid=${fid}`);
    if (!aroundResponse.ok) {
      throw new Error(`Fid HTTP error! Status: ${aroundResponse.status}`);
    }

    const responseData = await aroundResponse.json();
    if (
      responseData &&
      Array.isArray(responseData.allowancesData) &&
      typeof responseData.points === "string" &&
      typeof responseData.pointsRank === "string"
    ) {
      setData({
        data: responseData.allowancesData,
        points: responseData.points,
        pointsRank: responseData.pointsRank,
      });

    } else {
      throw new Error("Invalid response structure");
    }
  } catch (err) {
    console.error("Error fetching data from warpcast", err);
  }
}, []);


useEffect(() => {
  if (context?.user.fid) {
    Degen(String(context.user.fid));
  }
}, [context?.user.fid]);

const currentDate = new Date().toISOString().split("T")[0]; // Use current date
const formatSnapshotDay = (dateString: string) => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}-${month}`;
};

const shareText = encodeURIComponent(
  `$DEGEN stats \n \nV2 frame by @cashlessman.eth`
);

const tiped =  encodeURIComponent(
``
);
const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://degen-v2.vercel.app/`;
const tipUrl = `https://warpcast.com/~/compose?text=${tiped}&parentCastHash=0xefeba64cabdcfbc619b7d6003f993f460e3a6cef`;
  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!context?.user.fid)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="flex flex-col items-center justify-center text-white text-2xl p-4">
        <p className="flex items-center justify-center text-center">
          you need to access this frame from inside a farcaster client
        </p>
        <p className="flex items-center justify-center text-center">
          (click on the logo to open in Warpcast)
        </p>
    
        <div className="flex items-center justify-center p-2 bg-white rounded-lg mt-4">
          <Link href="https://warpcast.com/cashlessman.eth/0xefeba64c" className="shadow-lg shadow-white">
            <Image
              src="https://warpcast.com/og-logo.png"
              alt="warpcast logo"
              width={100}
              height={100}
            />
          </Link>
        </div>
      </div>
    </div>
    
    );


  return (
<div className="w-auto bg-slate-900 text-white h-screen">
<div className="w-auto bg-slate-900 text-white">
<h1 className="text-2xl font-bold text-center mb-4 hidden">{title}</h1>

  <header className="bg-slate-800 text-white py-4">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-2xl font-bold text-sky-400">$DEGEN Stats</h1>
    </div>
  </header>

  <div className="bg-[#0206178c] text-white text-center relative p-2">
  </div>

  <Stats />

  <div className="mt-4">
    {Array.isArray(data?.data) && data?.data.length > 0 ? (
      <Table />
    ) : (
      <Stake/>
    )}
  </div>

  <div className="mt-4 text-base/6 font-semibold">
    <div className="flex flex-row justify-self-center w-full">
      <div
        className="bg-[#8B5CF6] p-3 mt-2 justify-self-center flex-1 text-center"
        onClick={openUrl}
      >
        @cashlessman.eth
      </div>
      <div
        className="bg-[#8B5CF6] p-3 mt-2 ml-2 justify-self-center flex-1 text-center"
        onClick={openWarpcastUrl}
      >
        Share
      </div>
      {Array.isArray(data?.data) && data?.data.length > 0 && (
        <div
          className="bg-[#8B5CF6] p-3 mt-2 ml-2 justify-self-center flex-1 text-center"
          onClick={tip}
        >
          Tip
        </div>
      )}
      
    </div>
  </div>

  <div>
    {/* Placeholder for future functionality */}
    <div className="mt-2 mb-4 text-sm hidden">
      Client fid {context?.client.clientFid},
      {context?.client.added ? " frame added to client," : " frame not added to client,"}
      {notificationDetails ? " notifications enabled" : " notifications disabled"}
    </div>

    <div className="mt-0">
      <div className="mb-2 text-sm hidden">
        Add frame result: {addFrameResult}
      </div>
    </div>

    {/* <div className="mb-2 text-sm">
      Send notification result: {sendNotificationResult}
    </div>
    <div className="mb-4">
      <Button onClick={sendNotification} disabled={!notificationDetails}>
        Send notification
      </Button>
    </div> */}
    <div className="flex flex-row justify-self-center w-full">

    <div className="bg-[#8B5CF6] p-3 py-0 text-center mt-4 text-base/6 font-semibold flex-1 hidden">
      <Button
        className="p-0 m-0 border-none bg-transparent"
        onClick={addFrame}
        disabled={context?.client.added}
      >
        Add frame
      </Button>
    </div>

    <div
      className="bg-[#8B5CF6] p-3 text-center mt-4 text-base/6 font-semibold flex-1"
      onClick={close}
    >
      Close Frame
    </div>
    </div>
  </div>
</div>
</div>

  );

  function Stake( ) {
    return (
      <div className="mt-4 text-base/6 font-semibold text-center">Stake Atleast 10,000 $DEGEN to get Allowance

</div>
    );
  }

  function Stats( ) {
    return (
      <div className="flex flex-col w-full h-full bg-[#1e293b] text-white">
      <div className="flex items-center justify-center text-white mt-3">
        <img
          src={context?.user.pfpUrl}
          alt="Profile"
          className="w-11 h-11 rounded-lg mr-4"
        />
        <div className="flex flex-col">
          <span className="flex text-1xl">{context?.user.displayName ?? "Anonymous"}</span>
          <span className="flex text-1xl">@{context?.user.username ?? "unknown"}</span>
        </div>
      </div>
      <div className="flex text-1xl justify-center text-[#38BDf8] mt-1">{currentDate ?? "N/A"}</div>
      <div className="flex flex-row items-center justify-between text-[#885aee] mt-1 px-10">
        <div className="flex text-1xl">Allowance Rank: {data?.data[0]?.user_rank ?? "N/A"}</div>
        <div className="flex text-1xl">Points Rank: {data?.pointsRank ?? "N/A"}</div>

   
        </div>
        <div className="flex flex-col w-full text-[#86e635] mt-2">

        <div className="flex flex-row justify-between px-12">
          <span className="text-1xl">Allowance:</span>
          <span className="text-1xl">{data?.data[0]?.tip_allowance ?? "N/A"}</span>
        </div>

        <div className="flex flex-row justify-between px-12">
<span className="text-1xl">Remaining:</span>
<div className="flex">
  <span className="text-1xl">{data?.data[0]?.remaining_tip_allowance ?? "N/A"} </span>
  <span className="text-1xl ml-1">
{Array.isArray(data?.data) && data?.data.length > 0
  ? `(${((Number(data?.data[0]?.remaining_tip_allowance) / Number(data?.data[0]?.tip_allowance)) * 100).toFixed(1) ?? "N/A"}%)`
  : ""}
</span>

</div>
</div>
        <div className="flex flex-row justify-between px-12 mb-3">
          <span className="text-1xl">Points:</span>
          <span className="text-1xl">{data?.points ?? "0"}</span>

        </div>
        </div>
    </div>
    );
  }

  function Table( ) {
    return (
      <div className="bg-[#1E293B] p-3">
              <h1 className="text-2xl font-bold text-sky-400 text-center p-2 pt-0">Allowance Tracker</h1>

      <table className="table-auto w-auto bg-slate-700 text-lime-400 text-center">
      <thead className="sticky top-0 bg-slate-700">
          <tr className="text-white text-violet-400 border-b border-lime-400">
            <th className="px-4 py-2 min-w-[80px]">Date</th>
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">Allowance</th>
            <th className="px-4 py-2">Unused Allowance</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(data?.data) &&
  data?.data.length > 1 &&
  data.data.slice(0, -6).map((item, index) => (
    <tr key={index} className="odd:bg-slate-700 even:bg-slate-600">
      <td className="px-4 py-2">
        {formatSnapshotDay(item?.snapshot_day ?? "N/A")}
      </td>
      <td className="px-4 py-2">{item?.user_rank ?? "N/A"}</td>
      <td className="px-4 py-2">{item?.tip_allowance ?? "N/A"}</td>
      <td className="px-4 py-2">{item?.remaining_tip_allowance ?? "N/A"}</td>
    </tr>
  ))}
        </tbody>
      </table>
    </div>
    );
  }
}
