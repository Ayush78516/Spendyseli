"use client";

import { bulkDeleteTransaction } from '@/actions/account';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import useFetch from '@/hooks/use-fetch';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCcw, Search, Trash, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react'
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';


const pageSize=10;


const RECURRING_INTERVALS={
  DAILY:"Daily",
  WEEKLY:"Weekly",
  MONTHLY:"Monthly",
}




const TransactionTable = ({transactions}) => {

  const router=useRouter();

  const [selectedIds,setSelectedIds]=useState([]);
  const [sortConfig,setSortConfig]=useState({
    field:"date",
    direction:"desc",
  });


// FILTERS
const [searchTerm,setSearchTerm]=useState("");
const [typeFilter,setTypeFilter]=useState("");
const [recurringFilter,setRecurringFilter]=useState("");
const [currentPage,setCurrentPage]=useState(1);

const {
  loading:deleteLoading,
  fn:deleteFn,
  data:deleted,
}=useFetch(bulkDeleteTransaction);


const filteredAndSortedTransactions=useMemo(()=>{
  let result=[...transactions];

  //apply search filter
  if (searchTerm){
    const searchLower=searchTerm.toLowerCase();
    result=result.filter((transaction)=>
    transaction.description?.toLowerCase().includes(searchLower))
  };


  //apply recurring filter
  if (recurringFilter){
    result=result.filter((transaction)=>{
    if(recurringFilter==="recurring") return transaction.isRecurring;
    return !transaction.isRecurring;
  })
  };


  //apply type filter
  if (typeFilter){
    result=result.filter((transaction)=>transaction.type===typeFilter);
  }

  //apply sorting
  result.sort((a,b)=>{
    let comparison=0;

    switch(sortConfig.field){
      case "date":
        comparison=new Date(a.date) - new Date(b.date);
        break;
        case "amount":
        comparison=a.amount - b.amount;
        break;
        case "category":
        comparison=a.category.localeCompare(b.category);
        break;
        
        default:
        comparison=0;
    }

    return sortConfig.direction==="asc"?comparison:-comparison;

  })


  return result;

},[transactions,searchTerm,typeFilter,recurringFilter,sortConfig]);



const totalPage=Math.ceil(filteredAndSortedTransactions.length/pageSize);

const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredAndSortedTransactions.slice(start, end);
  }, [filteredAndSortedTransactions, currentPage]);


const[pageInput,setPageInput]=useState(currentPage);

useEffect(()=>{
  setPageInput(currentPage);
},[currentPage]);

const handleSort=(field)=>{
  setSortConfig((current)=>({
    field,
    direction:
      current.field==field && current.direction ==="asc"?"desc":"asc",
  }));
};


const handleSelect=(id)=>{
  setSelectedIds((current)=>
  current.includes(id)? 
    current.filter((item)=>item!=id):[...current,id]
  );
};



const handleSelectAll=()=>{
  setSelectedIds((current)=>
  current.length===filteredAndSortedTransactions.length
  ?[]
    :filteredAndSortedTransactions.map((t)=>t.id)
  );
};


const handleBulkDelete=()=>{
  if(!window.confirm(
    `Are you sure you want to delete ${selectedIds.length} transactions?`
  )
){
  return;
}
deleteFn(selectedIds);
};


useEffect(()=>{
  if(deleted && !deleteLoading){
    toast.error("Transactions deleted successfully");
  }
},[deleted,deleteLoading])


const handleClearFilters=()=>{
  setSearchTerm("");
  setTypeFilter("");
  setRecurringFilter("");
  setSelectedIds([]);
}


  return (
    <div className="space-y-4">

    {deleteLoading && <BarLoader width="100%" color="#9333ea"/>}

        {/* FILTERS */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
            <Input
            placeholder="Search Transaction..."
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            className="pl-8"
            />
          </div>


          <div className='flex gap-2'>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>


            <Select value={recurringFilter} onValueChange={(value)=>setRecurringFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring only</SelectItem>
                <SelectItem value="non-recurring">Non-Recurring only</SelectItem>
              </SelectContent>
            </Select>


            {selectedIds.length>0 && (
              <div className='flex items-center'>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash />
                  Delete Selected({selectedIds.length})
                </Button>
              </div>
            )}

            {(searchTerm || typeFilter || recurringFilter) && (
              <Button variant="outline" size="icon" 
              onClick={handleClearFilters} 
              title="Clear Filters"
              >
                <X className='h-4 w-4'/>
              </Button>
            )}

          </div>
        </div>


        {/* TRANSACTIONS */}
        <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>

                <TableHead className="w-[50px]">
                  <Checkbox onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length===filteredAndSortedTransactions.length &&
                    filteredAndSortedTransactions.length>0
                  }
                  />
                </TableHead>

                <TableHead 
                className="cursor-pointer" onClick={()=>handleSort("date")}
                >
                <div className="flex items-center">
                  Date
                  {sortConfig.field==="date" && (sortConfig.direction==="asc" ? (
                    <ChevronUp className="h-4 w-4"/>
                  ) : (
                    <ChevronDown className="h-4 w-4"/>
                  ))}
                </div> 
                </TableHead>


                <TableHead>Description</TableHead>


                <TableHead 
                className="cursor-pointer" onClick={()=>handleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {sortConfig.field==="category" && (sortConfig.direction==="asc" ? (
                    <ChevronUp className="h-4 w-4"/>
                  ) : (
                    <ChevronDown className="h-4 w-4"/>
                  ))}
                    </div>
                </TableHead>


                <TableHead 
                className="cursor-pointer" onClick={()=>handleSort("amount")}
                >
                  <div className="flex items-center justify-end">
                    Amount
                    {sortConfig.field==="amount" && (sortConfig.direction==="asc" ? (
                    <ChevronUp className="h-4 w-4"/>
                  ) : (
                    <ChevronDown className="h-4 w-4"/>
                  ))}
                  </div>
                </TableHead>

                <TableHead>Recurring</TableHead>
                <TableHead className="w-[50px]"/>

                </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length ===0?(
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No Transaction Found
                  </TableCell>
                </TableRow>
              ):(
                paginatedTransactions.map((transaction)=>(
                  <TableRow key={transaction.id}>
                <TableCell>
                  <Checkbox
                  onCheckedChange={()=>handleSelect(transaction.id)}
                  checked={selectedIds.includes(transaction.id)}
                  />
                </TableCell>
                <TableCell>{format(new Date(transaction.date),"PP")}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="capitalize">
                  <span
                    style={{background:categoryColors[transaction.category],
                    }}
                    className="px-2 py-1 rounded text-white text-sm"
                    >
                    {transaction.category}
                  </span>
                  </TableCell>
                <TableCell className="text-right"
                  style={{
                    color:transaction.type === "EXPENSE" ? "red" : "green",
                  }}
                  >
                  {transaction.type === "EXPENSE"? "-":"+"}$
                  {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring?(
                      <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-300">
                        <RefreshCcw className="h-3 w-3"/>
                        {
                          RECURRING_INTERVALS[
                            transaction.recurringInterval
                          ]
                        }
                        </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div>Next Date:</div>
                            <div>{format(new Date(transaction.nextRecurringDate),"PP")}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      </TooltipProvider>
                    ):(
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3"/>
                        one time
                        </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => 
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          } 
                          >
                            Edit
                          </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive"
                           onClick={()=> deleteFn([transaction.id])}
                          >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                ))
              )}
                
            </TableBody>
        </Table>
        </div>

      {/* pagination controls */}

      {totalPage>1 && (
        <div className='flex justify-center items-center gap-3'>

          {/* Previous page btn */}
            <Button
              variant="outline"
              size="sm"
              onClick={()=>setCurrentPage((prev)=>Math.max(prev-1,1))}
              disabled={currentPage==1}>
              ◀️Prev 
            </Button>

            {/* PageInput */}
            <div className='flex items-center gap-2'>
              <span>Page</span>
              <Input
              className="w-10 text-center"
              value={pageInput}
              onChange={(e)=>{
                const val=e.target.value;
                if(val===""|| /^\d+$/.test(val)){
                  setPageInput(val);
                }
              }}
              onBlur={()=>{
                let page=Number(pageInput);
                if (!page) page = 1;
                if (page < 1) page = 1;
                if (page > totalPage) page = totalPage;
                setPageInput(page);
                setCurrentPage(page);
              }}
              onKeyDown={(e)=>{
                if(e.key==="Enter"){
                  e.target.blur();
                }
              }}
              />
              <span>of {totalPage}</span>
              </div>
              
          
            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))}
              disabled={currentPage === totalPage}
            >
              Next ▶️
            </Button>
          
        </div>
      )}
    </div>
  );
};

export default TransactionTable;