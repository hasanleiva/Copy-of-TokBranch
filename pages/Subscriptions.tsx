import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Subscriptions: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['Watch videos', 'Like & Comment', 'Standard Support'],
      active: false,
      color: 'bg-white',
      textColor: 'text-gray-900',
      buttonStyle: 'bg-gray-100 text-black'
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      features: ['Ad-free experience', 'Exclusive branches', '4K Video Quality', 'Priority Support'],
      active: true,
      popular: true,
      color: 'bg-black',
      textColor: 'text-white',
      buttonStyle: 'bg-[#fe2c55] text-white'
    },
    {
      name: 'Pro Creator',
      price: '$19.99',
      period: '/month',
      features: ['Upload Unlimited', 'Analytics Dashboard', 'Monetization Tools', 'Verified Badge'],
      active: false,
      color: 'bg-white',
      textColor: 'text-gray-900',
      buttonStyle: 'bg-black text-white'
    }
  ];

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-black" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg mr-8">Subscription Plans</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <div className="text-center mb-8">
          <h2 className="text-xl font-black mb-2">Upgrade your experience</h2>
          <p className="text-gray-500 text-sm">Unlock exclusive content and features.</p>
        </div>

        <div className="space-y-6">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative rounded-3xl p-6 shadow-xl ${plan.color} ${plan.textColor} border border-gray-100 transition-transform hover:scale-[1.02] duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[#fe2c55] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                <span className={`text-sm opacity-60 font-medium`}>{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm">
                    <div className={`p-0.5 rounded-full ${plan.active ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <Check size={12} className={plan.active ? 'text-[#fe2c55]' : 'text-gray-500'} strokeWidth={3} />
                    </div>
                    <span className="opacity-90">{feat}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 ${plan.buttonStyle}`}>
                {plan.active ? 'Current Plan' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};