"use server"

import { z } from "zod"
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const FormSchema = z.object({
    id: z.string(),
    cutomerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(["pending", 'paid']),
    date: z.string()
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })

export async function createInvoice(formData: FormData) {
    const { cutomerId, amount, status } = CreateInvoice.parse({
        cutomerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    })
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0]

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${cutomerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
} 