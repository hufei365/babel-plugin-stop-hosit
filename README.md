# babel-plugin-stop-hosit
handle the require out of require.async

Q1: 发现在插件处理过程中，关于Node节点顺序问题。
      最后一个插件访问AST时，如果不做修改，理论应该和最终输出AST，但是目前发现不一致
