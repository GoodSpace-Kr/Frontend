// types/user.ts

// 사용자 정보 업데이트 요청 타입
export interface UpdateUserData {
  email: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  contactNumber1: string;
  contactNumber2: string;
  recipient: string;
  address: string;
  detailedAddress: string;
  postalCode: string;
}

// 주소 선택 데이터 타입
export interface AddressSelectedData {
  zipcode: string;
  address: string;
}

// API 에러 응답 타입
export interface ApiErrorResponse {
  error: string;
  details?: string;
  status?: number;
}

// Input 컴포넌트 Props 타입
export interface InputProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// InputC 컴포넌트 Props 타입
export interface InputCProps {
  zipcode: string;
  onAddressSelected: (data: AddressSelectedData) => void;
  onCancel: () => void;
}
