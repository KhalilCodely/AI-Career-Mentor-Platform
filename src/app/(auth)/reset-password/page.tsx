import { ResetPasswordForm } from "./ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] ?? "" : params.token ?? "";

  return <ResetPasswordForm token={token} />;
}
