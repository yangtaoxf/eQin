package com.example.bing.eqin.fragment.home;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.design.widget.TabLayout;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import com.example.bing.eqin.R;
import com.example.bing.eqin.adapter.MessageAdapter;
import com.example.bing.eqin.controller.MessageController;
import com.example.bing.eqin.fragment.dashboard.ControllerFragment;
import com.example.bing.eqin.fragment.dashboard.SensorFragment;
import com.example.bing.eqin.fragment.settings.SettingFragment;
import com.example.bing.eqin.model.MQTTDataItem;
import com.example.bing.eqin.model.MessageItem;
import com.example.bing.eqin.utils.ItemDecoration;

import org.greenrobot.eventbus.Subscribe;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import static com.parse.Parse.getApplicationContext;

public class MessageFragment extends Fragment{

    private RecyclerView messageContainer;
    private SwipeRefreshLayout swipeRefreshLayout;
    private List<MessageItem> messageItems;
    private MessageAdapter messageAdapter;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_message, container, false);

        messageItems = new LinkedList<>();
        messageAdapter = new MessageAdapter(R.layout.item_message, messageItems);
        getData();

        messageContainer =  view.findViewById(R.id.message_container);
        swipeRefreshLayout = view.findViewById(R.id.message_swipe_refresh);

        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                getData();
                swipeRefreshLayout.setRefreshing(false);
            }
        });

        messageContainer.setLayoutManager(new LinearLayoutManager(getContext()));
        messageContainer.addItemDecoration(new ItemDecoration(5));
        messageAdapter.bindToRecyclerView(messageContainer);



        return view;
    }

    private void getData() {
        messageItems.clear();
        messageItems.addAll(MessageController.getInstance().getMessages());
        messageAdapter.notifyDataSetChanged();
    }


}
