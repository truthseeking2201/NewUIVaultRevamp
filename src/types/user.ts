// {
//         "email": null,
//         "status": "APPROVED",
//         "wallet_provider": "phantom",
//         "wallet_address": "0x5bcd355ba55573a0aa2d057b4c89b5dd33722f46432146e95bea22ed2fa0307e",
//         "timestamp": "2025-06-11T11:02:51.151Z",
//         "metadata": null,
//         "invite_code": {
//             "created_at": "2025-06-11T11:08:24.554Z",
//             "updated_at": "2025-06-11T11:08:24.554Z",
//             "id": "15",
//             "code": "NMFHNM",
//             "type": "EXISTED",
//             "nodo_account": {
//                 "code": "NMFHNM",
//                 "email": "hienxi26@gmail.com",
//                 "user_id": "4438",
//                 "full_name": "Hien Xi",
//                 "created_at": "2025-06-10T10:16:10.788Z",
//                 "updated_at": "2025-06-10T10:16:10.788Z",
//                 "deleted_flg": false,
//                 "from_source": "Phantom",
//                 "reference_code": null,
//                 "wallet_address": "0x5bcd355ba55573a0aa2d057b4c89b5dd33722f46432146e95bea22ed2fa0307e"
//             }
//         }
//     }

export type UserType = {
  email?: string;
  status: string;
  wallet_provider: string;
  wallet_address: string;
  timestamp: string;
  metadata?: any;
  is_skip_invitation_code?: boolean;
  invite_code: {
    created_at: string;
    updated_at: string;
    id: string;
    code: string;
    type: string;
    nodo_account: {
      code: string;
      email: string;
      user_id: string;
      full_name: string;
      created_at: string;
      updated_at: string;
      deleted_flg: boolean;
      from_source: string;
      reference_code?: string;
      wallet_address: string;
    };
  } | null;
};
