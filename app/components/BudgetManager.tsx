'use client';

import { useState, useEffect } from 'react';
import { 
  fetchBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget, 
  fetchExpenses,
  createExpense,
  deleteExpense,
  updateItineraryBudget
} from '../../lib/client-api';
import { Budget, Expense } from '../../lib/models';
import { 
  Card, 
  CardContent 
} from '../components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Progress } from '../components/ui/progress';
// import { Separator } from '../components/ui/separator';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

interface BudgetManagerProps {
  itineraryId: string;
  initialTotalBudget?: number;
  initialCurrency?: string;
}

// 予算カテゴリ
const BUDGET_CATEGORIES = [
  { id: 'transportation', name: '交通費' },
  { id: 'accommodation', name: '宿泊費' },
  { id: 'food', name: '食費' },
  { id: 'activities', name: 'アクティビティ' },
  { id: 'shopping', name: 'ショッピング' },
  { id: 'other', name: 'その他' },
];

export default function BudgetManager({ 
  itineraryId, 
  initialTotalBudget = 0,
  initialCurrency = 'JPY' 
}: BudgetManagerProps) {
  // State
  const [totalBudget, setTotalBudget] = useState<number>(initialTotalBudget);
  const [currency, setCurrency] = useState<string>(initialCurrency);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Using the activeTab state for tab switching
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // 新規予算用の状態
  const [newBudget, setNewBudget] = useState({
    category: 'transportation',
    name: '',
    amount: 0,
    notes: '',
  });
  
  // 新規支出用の状態
  const [newExpense, setNewExpense] = useState({
    budgetId: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    category: 'transportation',
    paymentMethod: '',
  });

  // 編集中の予算
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  // ダイアログの状態
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isTotalBudgetDialogOpen, setIsTotalBudgetDialogOpen] = useState(false);

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 旅程データを取得して総予算を設定
        const itineraryResponse = await fetch(`/api/itineraries/${itineraryId}`);
        if (itineraryResponse.ok) {
          const itineraryData = await itineraryResponse.json();
          console.log('Loaded itinerary data:', itineraryData);
          
          // 総予算と通貨を設定
          if (itineraryData.totalBudget !== undefined && itineraryData.totalBudget !== null) {
            console.log('Setting total budget from API:', itineraryData.totalBudget);
            setTotalBudget(Number(itineraryData.totalBudget));
          } else {
            console.log('No totalBudget found in itinerary data, using default:', initialTotalBudget);
            setTotalBudget(initialTotalBudget);
          }
          
          if (itineraryData.currency) {
            console.log('Setting currency from API:', itineraryData.currency);
            setCurrency(itineraryData.currency);
          } else {
            console.log('No currency found in itinerary data, using default:', initialCurrency);
            setCurrency(initialCurrency);
          }
        } else {
          console.error('Failed to fetch itinerary data:', itineraryResponse.status);
          // デフォルト値を設定
          setTotalBudget(initialTotalBudget);
          setCurrency(initialCurrency);
        }
        
        // 予算データを取得
        const budgetsData = await fetchBudgets(itineraryId);
        setBudgets(budgetsData);
        
        // 支出データを取得
        const expensesData = await fetchExpenses(itineraryId);
        setExpenses(expensesData);
      } catch (error) {
        console.error('予算データの取得に失敗しました', error);
        // エラー時はデフォルト値を設定
        setTotalBudget(initialTotalBudget);
        setCurrency(initialCurrency);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [itineraryId, initialTotalBudget, initialCurrency]);

  // 総予算の更新
  const handleTotalBudgetUpdate = async () => {
    try {
      if (totalBudget < 0) {
        alert('予算額は0以上で入力してください');
        return;
      }
      
      // 保存前にログ出力
      console.log('Updating total budget:', { itineraryId, totalBudget, currency });
      
      try {
        // 総予算を更新
        const updated = await updateItineraryBudget(itineraryId, totalBudget, currency);
        console.log('Budget update response:', updated);
        
        // 更新後のデータを取得して確認
        const verifyResponse = await fetch(`/api/itineraries/${itineraryId}`);
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('Verified updated itinerary data:', verifyData);
          
          // 更新後の値をUIに反映
          if (verifyData.totalBudget !== undefined && verifyData.totalBudget !== null) {
            console.log('Setting verified total budget:', verifyData.totalBudget);
            setTotalBudget(Number(verifyData.totalBudget));
          } else {
            console.log('No totalBudget in verified data, using input value:', totalBudget);
            setTotalBudget(totalBudget);
          }
          
          if (verifyData.currency) {
            console.log('Setting verified currency:', verifyData.currency);
            setCurrency(verifyData.currency);
          }
        } else {
          // 確認に失敗した場合は入力値を使用
          console.warn('Failed to verify update, using input values');
          setTotalBudget(totalBudget);
          setCurrency(currency);
        }
        
        // ダイアログを閉じる
        setIsTotalBudgetDialogOpen(false);
        
        // 成功メッセージ
        console.log('総予算を正常に更新しました');
      } catch (updateError) {
        console.error('総予算の更新中にエラーが発生しました:', updateError);
        throw updateError; // 外部のcatchブロックに渡す
      }
    } catch (error) {
      console.error('総予算の更新に失敗しました', error);
      alert('総予算の更新に失敗しました\nもう一度お試しください');
    }
  };

  // 予算の追加
  const handleAddBudget = async () => {
    try {
      const budget = await createBudget({
        itineraryId,
        ...newBudget,
        orderIndex: budgets.length, // Add orderIndex to fix the type error
      });
      
      setBudgets([...budgets, budget]);
      setNewBudget({
        category: 'transportation',
        name: '',
        amount: 0,
        notes: '',
      });
      setIsBudgetDialogOpen(false);
    } catch (error) {
      console.error('予算の追加に失敗しました', error);
    }
  };

  // 予算の更新
  const handleUpdateBudget = async () => {
    if (!editingBudget) return;
    
    try {
      const updatedBudget = await updateBudget(editingBudget.id, {
        category: editingBudget.category,
        name: editingBudget.name,
        amount: editingBudget.amount,
        notes: editingBudget.notes,
      });
      
      setBudgets(budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b));
      setEditingBudget(null);
      setIsBudgetDialogOpen(false);
    } catch (error) {
      console.error('予算の更新に失敗しました', error);
    }
  };

  // 予算の削除
  const handleDeleteBudget = async (id: string) => {
    if (!confirm('この予算を削除してもよろしいですか？関連する支出も削除されます。')) return;
    
    try {
      await deleteBudget(id);
      setBudgets(budgets.filter(b => b.id !== id));
      setExpenses(expenses.filter(e => e.budgetId !== id));
    } catch (error) {
      console.error('予算の削除に失敗しました', error);
    }
  };

  // 支出の追加
  const handleAddExpense = async () => {
    try {
      const expense = await createExpense({
        itineraryId,
        ...newExpense,
      });
      
      setExpenses([expense, ...expenses]);
      setNewExpense({
        budgetId: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        category: 'transportation',
        paymentMethod: '',
      });
      setIsExpenseDialogOpen(false);
    } catch (error) {
      console.error('支出の追加に失敗しました', error);
    }
  };

  // 支出の削除
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('この支出を削除してもよろしいですか？')) return;
    
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      console.error('支出の削除に失敗しました', error);
    }
  };

  // 予算カテゴリごとの合計を計算
  const getBudgetTotalByCategory = (category: string) => {
    return budgets
      .filter(b => b.category === category)
      .reduce((sum, b) => sum + b.amount, 0);
  };

  // 支出カテゴリごとの合計を計算
  const getExpenseTotalByCategory = (category: string) => {
    return expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // 予算カテゴリごとの支出合計を計算
  const getExpenseTotalByBudgetId = (budgetId: string) => {
    return expenses
      .filter(e => e.budgetId === budgetId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // 総予算に対する支出の割合
  const getTotalExpensePercentage = () => {
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    return totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
  };

  // 予算に対する支出の割合
  const getBudgetExpensePercentage = (budget: Budget) => {
    const totalExpense = getExpenseTotalByBudgetId(budget.id);
    return budget.amount > 0 ? (totalExpense / budget.amount) * 100 : 0;
  };

  // 総予算 (カテゴリ別予算の合計)
  // const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
  
  // 総支出
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 残りの予算
  const remainingBudget = totalBudget - totalExpenseAmount;

  // 通貨フォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">予算管理</h2>
        <Button 
          className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800" 
          onClick={() => setIsTotalBudgetDialogOpen(true)}
        >
          総予算を設定
        </Button>
      </div>

      {/* 総予算の概要 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-medium">総予算</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">残り予算</h3>
              <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-500' : ''}`}>
                {formatCurrency(remainingBudget)}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">支出</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenseAmount)}</p>
            </div>
          </div>
          <Progress value={getTotalExpensePercentage()} className="h-2" />
          <p className="text-sm text-gray-500 mt-1">
            予算の {getTotalExpensePercentage().toFixed(1)}% を使用済み
          </p>
        </CardContent>
      </Card>

      {/* タブ */}
      <Tabs defaultValue="overview" onValueChange={(value) => {
        setActiveTab(value);
        console.log('Active tab changed to:', value);
      }}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="budgets">予算</TabsTrigger>
          <TabsTrigger value="expenses">支出</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-4">
          <h3 className="text-lg font-medium mt-4">カテゴリ別予算と支出</h3>
          {BUDGET_CATEGORIES.map(category => {
            const budgetTotal = getBudgetTotalByCategory(category.id);
            const expenseTotal = getExpenseTotalByCategory(category.id);
            const percentage = budgetTotal > 0 ? (expenseTotal / budgetTotal) * 100 : 0;
            
            return (
              <div key={category.id} className="space-y-1">
                <div className="flex justify-between">
                  <span>{category.name}</span>
                  <span>
                    {formatCurrency(expenseTotal)} / {formatCurrency(budgetTotal)}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </TabsContent>

        {/* 予算タブ */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {
              setEditingBudget(null);
              setIsBudgetDialogOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              予算を追加
            </Button>
          </div>

          {budgets.length === 0 ? (
            <p className="text-center py-4 text-gray-500">予算がまだ設定されていません</p>
          ) : (
            <div className="space-y-4">
              {budgets.map(budget => {
                const expenseTotal = getExpenseTotalByBudgetId(budget.id);
                const percentage = getBudgetExpensePercentage(budget);
                const categoryName = BUDGET_CATEGORIES.find(c => c.id === budget.category)?.name || budget.category;
                
                return (
                  <Card key={budget.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{budget.name}</h3>
                          <p className="text-sm text-gray-500">{categoryName}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                            onClick={() => {
                              setEditingBudget(budget);
                              setIsBudgetDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                            onClick={() => handleDeleteBudget(budget.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex justify-between">
                          <span>支出</span>
                          <span>
                            {formatCurrency(expenseTotal)} / {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2 mt-1" />
                        <p className="text-sm text-gray-500 mt-1">
                          予算の {percentage.toFixed(1)}% を使用済み
                        </p>
                      </div>
                      
                      {budget.notes && (
                        <p className="text-sm mt-2 text-gray-600">{budget.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 支出タブ */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {
              setNewExpense({
                ...newExpense,
                budgetId: budgets.length > 0 ? budgets[0].id : '',
              });
              setIsExpenseDialogOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              支出を追加
            </Button>
          </div>

          {expenses.length === 0 ? (
            <p className="text-center py-4 text-gray-500">支出がまだ記録されていません</p>
          ) : (
            <div className="space-y-4">
              {expenses.map(expense => {
                const budget = budgets.find(b => b.id === expense.budgetId);
                const categoryName = BUDGET_CATEGORIES.find(c => c.id === expense.category)?.name || expense.category;
                
                return (
                  <Card key={expense.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{expense.description}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(expense.date).toLocaleDateString('ja-JP')} • {categoryName}
                          </p>
                          {budget && (
                            <p className="text-xs text-gray-500">予算: {budget.name}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{formatCurrency(expense.amount)}</p>
                          <Button 
                            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 総予算設定ダイアログ */}
      <Dialog open={isTotalBudgetDialogOpen} onOpenChange={setIsTotalBudgetDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">総予算の設定</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="totalBudget" className="text-base font-medium">総予算額</Label>
              <div className="flex items-center">
                <div className="relative flex-1">
                  <Input
                    id="totalBudget"
                    type="number"
                    value={totalBudget}
                    min="0"
                    step="1000"
                    className="pr-12 text-lg h-12 font-medium"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalBudget(Number(e.target.value))}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                    {currency === 'JPY' ? '円' : currency}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="currency" className="text-base font-medium">通貨</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="通貨を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JPY">日本円 (JPY)</SelectItem>
                  <SelectItem value="USD">米ドル (USD)</SelectItem>
                  <SelectItem value="EUR">ユーロ (EUR)</SelectItem>
                  <SelectItem value="GBP">英ポンド (GBP)</SelectItem>
                  <SelectItem value="KRW">韓国ウォン (KRW)</SelectItem>
                  <SelectItem value="CNY">中国元 (CNY)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-center gap-3 mt-2">
            <Button 
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 h-12 px-6 text-base" 
              onClick={() => setIsTotalBudgetDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button 
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-6 text-base"
              onClick={handleTotalBudgetUpdate}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 予算追加/編集ダイアログ */}
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? '予算の編集' : '予算の追加'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budgetName">予算名</Label>
              <Input
                id="budgetName"
                value={editingBudget ? editingBudget.name : newBudget.name}
                onChange={(e) => {
                  if (editingBudget) {
                    setEditingBudget({ ...editingBudget, name: e.target.value });
                  } else {
                    setNewBudget({ ...newBudget, name: e.target.value });
                  }
                }}
                placeholder="例: 東京-大阪 新幹線"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetCategory">カテゴリ</Label>
              <Select 
                value={editingBudget ? editingBudget.category : newBudget.category}
                onValueChange={(value: string) => {
                  if (editingBudget) {
                    setEditingBudget({ ...editingBudget, category: value });
                  } else {
                    setNewBudget({ ...newBudget, category: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">予算額</Label>
              <Input
                id="budgetAmount"
                type="number"
                value={editingBudget ? editingBudget.amount : newBudget.amount}
                onChange={(e) => {
                  const amount = Number(e.target.value);
                  if (editingBudget) {
                    setEditingBudget({ ...editingBudget, amount });
                  } else {
                    setNewBudget({ ...newBudget, amount });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetNotes">メモ (オプション)</Label>
              <Input
                id="budgetNotes"
                value={editingBudget ? editingBudget.notes || '' : newBudget.notes}
                onChange={(e) => {
                  if (editingBudget) {
                    setEditingBudget({ ...editingBudget, notes: e.target.value });
                  } else {
                    setNewBudget({ ...newBudget, notes: e.target.value });
                  }
                }}
                placeholder="メモを入力"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800" 
              onClick={() => setIsBudgetDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button 
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={editingBudget ? handleUpdateBudget : handleAddBudget}
            >
              {editingBudget ? '更新' : '追加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 支出追加ダイアログ */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>支出の追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expenseBudget">予算</Label>
              <Select 
                value={newExpense.budgetId}
                onValueChange={(value: string) => setNewExpense({ ...newExpense, budgetId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="予算を選択" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map(budget => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">日付</Label>
              <Input
                id="expenseDate"
                type="date"
                value={newExpense.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseAmount">金額</Label>
              <Input
                id="expenseAmount"
                type="number"
                value={newExpense.amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDescription">説明</Label>
              <Input
                id="expenseDescription"
                value={newExpense.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="例: 新幹線チケット"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseCategory">カテゴリ</Label>
              <Select 
                value={newExpense.category}
                onValueChange={(value: string) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expensePaymentMethod">支払い方法 (オプション)</Label>
              <Input
                id="expensePaymentMethod"
                value={newExpense.paymentMethod}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                placeholder="例: クレジットカード"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800" 
              onClick={() => setIsExpenseDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button 
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleAddExpense}
            >
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
