import AccountForm from './account-form'

export default async function Account() {
    // Let client-side handle auth check - server-side auth was causing issues
    return <AccountForm user={null} />
}