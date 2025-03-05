'use server'
 
import { redirect } from 'next/navigation'
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function login(prevState: any, formData: FormData) {

    const rawFormData = {
        username: formData.get('username'),
        password: formData.get('password'),
        
      }

    if (rawFormData.username == 'admin' && rawFormData.password == 'admin') {
        redirect('/')
    }else {
        return { message: 'Username and Password is not correct' }
    }

}
