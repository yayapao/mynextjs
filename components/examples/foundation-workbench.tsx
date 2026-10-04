'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@animateicons/react/lucide/plus-icon';
import { Trash2Icon } from '@animateicons/react/lucide/trash-2-icon';
import { Search, Plus } from 'lucide-react';
import { AnimatedIconButton } from '@/components/ui/animated-icon-button';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { TextureButton } from '@/components/ui/texture-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WorkItem, WorkItemForm } from '@/types';

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '请输入工作项名称')
    .max(80, '名称最多 80 个字符'),
});
const initialItems: WorkItem[] = [
  { id: '1', title: '项目初始化', completed: true },
  { id: '2', title: '界面设计', completed: false },
  { id: '3', title: '应用交付', completed: false },
];

export function FoundationWorkbench() {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState(false);
  const form = useForm<WorkItemForm>({
    resolver: zodResolver(schema),
    defaultValues: { title: '' },
  });
  const completed = items.filter((item) => item.completed).length;
  const visible = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.trim().toLowerCase()) &&
      (tab === 'all' || (tab === 'done' ? item.completed : !item.completed))
  );

  function addItem(values: WorkItemForm) {
    setItems((current) => [
      ...current,
      { id: crypto.randomUUID(), title: values.title, completed: false },
    ]);
    setOpen(false);
    form.reset();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="page-heading">工作台</h1>
        <TextureButton
          onClick={() => {
            form.reset();
            setOpen(true);
          }}
        >
          <Plus aria-hidden />
          新建工作项
        </TextureButton>
      </div>
      <dl className="my-6 grid grid-cols-3 gap-4 border-y py-5">
        {[
          ['全部', items.length, 'text-foreground'],
          ['待办', items.length - completed, 'text-warning'],
          ['已完成', completed, 'text-success'],
        ].map(([label, value, color]) => (
          <div key={label} className="min-w-0">
            <dt className="mb-2 text-xs text-muted-foreground">{label}</dt>
            <dd className={String(color)}>
              <AnimatedNumber
                value={Number(value)}
                className="text-2xl font-semibold"
              />
            </dd>
          </div>
        ))}
      </dl>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="工作项状态">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="todo">待办</TabsTrigger>
            <TabsTrigger value="done">已完成</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-60">
          <Search
            className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索工作项"
            aria-label="搜索工作项"
            className="pl-9"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <span className="sr-only">完成</span>
            </TableHead>
            <TableHead>工作项</TableHead>
            <TableHead className="w-24">状态</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">操作</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={item.completed}
                  aria-label={`标记${item.title}${item.completed ? '未完成' : '完成'}`}
                  onCheckedChange={(checked) =>
                    setItems((current) =>
                      current.map((row) =>
                        row.id === item.id
                          ? { ...row, completed: checked === true }
                          : row
                      )
                    )
                  }
                />
              </TableCell>
              <TableCell className="max-w-0 whitespace-normal break-words font-medium">
                {item.title}
              </TableCell>
              <TableCell>
                <Badge variant={item.completed ? 'success' : 'warning'}>
                  {item.completed ? '已完成' : '待办'}
                </Badge>
              </TableCell>
              <TableCell>
                <AnimatedIconButton
                  icon={Trash2Icon}
                  label={`删除${item.title}`}
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setItems((current) =>
                      current.filter((row) => row.id !== item.id)
                    )
                  }
                />
              </TableCell>
            </TableRow>
          ))}
          {!visible.length && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-muted-foreground"
              >
                暂无工作项
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>新建工作项</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input maxLength={80} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={form.formState.isSubmitting}
                >
                  <PlusIcon size={16} isAnimated={false} aria-hidden />
                  创建
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
