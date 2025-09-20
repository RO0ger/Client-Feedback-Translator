'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { History, Search, FileCode, Calendar, Trash2 } from 'lucide-react'
import { trpc } from '@/utils/trpc'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export function HistorySidebar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const utils = trpc.useUtils()

  const { data: searchResults } = trpc.history.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  )

  const { data, fetchNextPage, hasNextPage } = trpc.history.getInfinite.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !searchQuery,
    }
  )

  const deleteAnalysis = trpc.history.delete.useMutation({
    onSuccess: () => {
      toast.success('Analysis deleted')
      utils.history.getInfinite.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const historyItems = searchQuery ? searchResults : data?.pages.flatMap(p => p.items) ?? []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="fixed top-6 right-6 p-4 bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-50">
          <History className="h-6 w-6 text-gray-700" />
        </button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:w-96 p-0 bg-white/80 backdrop-blur-md border-l border-white/20 shadow-2xl">
        <SheetHeader className="p-6 border-b border-gray-200/50">
          <SheetTitle className="flex items-center gap-3 text-xl">
            <History className="h-6 w-6" />
            Analysis History
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 border-b border-gray-200/50">
          <Command>
            <CommandInput
              placeholder="Search your analyses..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-0 focus:ring-0"
            />
          </Command>
        </div>

        <ScrollArea className="flex-1 p-4">
          <CommandList>
            {historyItems.length === 0 ? (
              <div className="text-center py-12">
                <FileCode className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No analyses found</p>
              </div>
            ) : (
              historyItems.map((item) => (
                <CommandItem
                  key={item.id}
                  className="flex flex-col items-start gap-3 p-4 rounded-xl hover:bg-gray-50/80 cursor-pointer border border-transparent hover:border-gray-200/50 mb-2"
                  onSelect={() => {
                    router.push(`/results/${item.id}`)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2 flex-1">
                      <FileCode className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {item.fileName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.confidence}%
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAnalysis.mutate({ id: item.id })
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 w-full">
                    {item.feedback}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </div>
                </CommandItem>
              ))
            )}
          </CommandList>

          {hasNextPage && !searchQuery && (
            <button
              onClick={() => fetchNextPage()}
              className="w-full mt-4 py-3 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
            >
              Load more analyses...
            </button>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
