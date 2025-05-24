import { useState, useEffect, useCallback } from 'react';
import { 
  UseTemplatesReturn, 
  Template, 
  TemplateCategory 
} from '@/types';
import { CustomTester } from '@/utils/customTester';

/**
 * 模板管理自定义Hook
 */
export const useTemplates = (): UseTemplatesReturn => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 初始化加载模板
   */
  useEffect(() => {
    try {
      const loadedTemplates = CustomTester.getTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 保存新模板
   */
  const saveTemplate = useCallback((templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate = CustomTester.saveTemplate(templateData);
      setTemplates(prevTemplates => [...prevTemplates, newTemplate]);
      return newTemplate;
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error;
    }
  }, []);

  /**
   * 更新模板
   */
  const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
    try {
      const updatedTemplate = CustomTester.updateTemplate(id, updates);
      if (updatedTemplate) {
        setTemplates(prevTemplates =>
          prevTemplates.map(template =>
            template.id === id ? updatedTemplate : template
          )
        );
        return updatedTemplate;
      }
      return null;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }, []);

  /**
   * 删除模板
   */
  const deleteTemplate = useCallback((id: string) => {
    try {
      const success = CustomTester.deleteTemplate(id);
      if (success) {
        setTemplates(prevTemplates =>
          prevTemplates.filter(template => template.id !== id)
        );
      }
      return success;
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }, []);
  

  /**
   * 加载模板
   */
  const loadTemplate = useCallback((id: string): Template | undefined => {
    return templates.find(template => template.id === id);
  }, [templates]);

  /**
   * 根据分类获取模板
   */
  const getTemplatesByCategory = useCallback((category: TemplateCategory): Template[] => {
    return templates.filter(template => template.category === category);
  }, [templates]);

  /**
   * 导入模板
   */
  const importTemplates = useCallback((importedTemplates: Template[]) => {
    try {
      CustomTester.importTemplates(importedTemplates);
      // 重新加载所有模板
      const refreshedTemplates = CustomTester.getTemplates();
      setTemplates(refreshedTemplates);
    } catch (error) {
      console.error('Failed to import templates:', error);
      throw error;
    }
  }, []);

  /**
   * 导出模板
   */
  const exportTemplates = useCallback((): Template[] => {
    try {
      return CustomTester.exportTemplates();
    } catch (error) {
      console.error('Failed to export templates:', error);
      throw error;
    }
  }, []);

  /**
   * 复制模板
   */
  const duplicateTemplate = useCallback((id: string): Template | null => {
    const originalTemplate = loadTemplate(id);
    if (!originalTemplate) {
      return null;
    }

    try {
      const duplicatedTemplate = saveTemplate({
        name: `${originalTemplate.name} (副本)`,
        description: originalTemplate.description,
        category: originalTemplate.category,
        request: { ...originalTemplate.request },
      });
      return duplicatedTemplate;
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      throw error;
    }
  }, [loadTemplate, saveTemplate]);

  /**
   * 搜索模板
   */
  const searchTemplates = useCallback((query: string): Template[] => {
    if (!query.trim()) {
      return templates;
    }

    const lowerQuery = query.toLowerCase();
    return templates.filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.request.url.toLowerCase().includes(lowerQuery)
    );
  }, [templates]);

  /**
   * 验证模板
   */
  const validateTemplate = useCallback((template: Partial<Template>): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    // 验证基本字段
    if (!template.name?.trim()) {
      errors.push('模板名称不能为空');
    }

    if (!template.description?.trim()) {
      errors.push('模板描述不能为空');
    }

    if (!template.category) {
      errors.push('必须选择模板分类');
    }

    // 验证请求配置
    if (template.request) {
      const requestValidation = CustomTester.validateRequest(template.request);
      if (!requestValidation.isValid) {
        errors.push(...requestValidation.errors);
      }
    } else {
      errors.push('请求配置不能为空');
    }

    // 检查模板名称是否重复（排除自己）
    const existingTemplate = templates.find(t => 
      t.name === template.name?.trim() && t.id !== (template as Template).id
    );
    if (existingTemplate) {
      errors.push('模板名称已存在');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [templates]);

  /**
   * 获取模板统计信息
   */
  const getTemplateStats = useCallback(() => {
    const stats = {
      total: templates.length,
      byCategory: Object.values(TemplateCategory).reduce((acc, category) => {
        acc[category] = templates.filter(t => t.category === category).length;
        return acc;
      }, {} as Record<TemplateCategory, number>),
      recentlyCreated: templates
        .filter(t => {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return t.createdAt > oneWeekAgo;
        })
        .length,
      recentlyUpdated: templates
        .filter(t => {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return t.updatedAt > oneWeekAgo;
        })
        .length,
    };

    return stats;
  }, [templates]);

  /**
   * 重置模板（恢复默认模板）
   */
  const resetTemplates = useCallback(() => {
    try {
      // 清空localStorage
      localStorage.removeItem('ai-key-checker-templates');
      // 重新加载默认模板
      const defaultTemplates = CustomTester.getTemplates();
      setTemplates(defaultTemplates);
    } catch (error) {
      console.error('Failed to reset templates:', error);
      throw error;
    }
  }, []);

  /**
   * 导出为JSON文件
   */
  const exportToFile = useCallback((filename?: string) => {
    try {
      const exportData = exportTemplates();
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `templates-${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Failed to export templates to file:', error);
      throw error;
    }
  }, [exportTemplates]);

  /**
   * 从文件导入
   */
  const importFromFile = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedTemplates = JSON.parse(content) as Template[];
          
          // 验证导入的数据格式
          if (!Array.isArray(importedTemplates)) {
            throw new Error('无效的文件格式：应为模板数组');
          }

          // 验证每个模板
          for (const template of importedTemplates) {
            const validation = validateTemplate(template);
            if (!validation.isValid) {
              throw new Error(`模板 "${template.name}" 验证失败: ${validation.errors.join(', ')}`);
            }
          }

          importTemplates(importedTemplates);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsText(file);
    });
  }, [importTemplates, validateTemplate]);

  return {
    templates,
    isLoading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    loadTemplate,
    getTemplatesByCategory,
    importTemplates,
    exportTemplates,
    duplicateTemplate,
    searchTemplates,
    validateTemplate,
    getTemplateStats,
    resetTemplates,
    exportToFile,
    importFromFile,
  };
}; 