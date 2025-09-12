
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { createUser } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import type { District, SubDivision, Circle } from '@/lib/definitions';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  username: z.string().length(10, 'Username must be a 10-digit phone number.'),
  designation: z.string().min(1, 'Designation is required.'),
  email: z.string().email('Invalid email address.'),
  role: z.string().min(1, 'Role is required.'),
  district_ids: z.array(z.string()).min(1, 'At least one district is required.'),
  sub_division_ids: z.array(z.string()).optional(),
  circle_ids: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const roles = ["Admin", "Cabinet", "Checker", "DC", "DFO", "DLC", "LLMC", "LRD", "PDA", "SDAO", "SDC", "SDO/DAO", "SLC"];

interface CreateUserFormProps {
  districts: District[];
  subDivisions: SubDivision[];
  circles: Circle[];
  accessToken: string;
}

export function CreateUserForm({ districts, subDivisions, circles, accessToken }: CreateUserFormProps) {
  const { toast } = useToast();
  const { addLog } = useDebug();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district_ids: [],
      sub_division_ids: [],
      circle_ids: [],
    },
  });

  const { handleSubmit, control, reset } = form;

  const processForm = async (values: FormValues) => {
    setIsSubmitting(true);
    
    const payload = {
        ...values,
        district_ids: values.district_ids.map(id => parseInt(id)),
        sub_division_ids: values.sub_division_ids?.map(id => parseInt(id)),
        circle_ids: values.circle_ids?.map(id => parseInt(id)),
    };
    
    const result = await createUser(payload, accessToken);
    addLog(result.debugLog || 'Create user log');

    if (result.success) {
      toast({
        title: 'User Created',
        description: result.message || 'The new user has been created successfully.',
      });
      reset();
      setIsOpen(false);
      // Here you would typically trigger a refetch of the user list
    } else {
      toast({
        title: 'Creation Failed',
        description: result.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Fill in the details below to create a new user account.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(processForm)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="Enter full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username (Phone)</FormLabel>
                    <FormControl><Input placeholder="10-digit number" {...field} maxLength={10} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl><Input placeholder="Enter designation" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={control}
                name="district_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Districts</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value.join(',')}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select districts" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                     <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={control}
                name="sub_division_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Divisions (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.join(',')}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select sub-divisions" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {subDivisions.map(sd => <SelectItem key={sd.id} value={sd.id.toString()}>{sd.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                     <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={control}
                name="circle_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circles (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.join(',')}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select circles" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {circles.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                     <FormMessage />
                  </FormItem>
                )}
              />
             <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
